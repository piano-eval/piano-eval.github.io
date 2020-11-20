/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

function Page(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language) {
  this.pageManager = _pageManager;
  this.pageTemplateRenderer = _pageTemplateRenderer;
  this.pageConfig = _pageConfig;
  this.session = _session;
  this.language = _language;
  if (this.pageConfig.questionnaire === undefined) {
    this.pageConfig.questionnaire = [];
  }
  this.questionnaireResponses = {};
}

/**
 * @return {String} Returns the name of the page. Objects of a Page class might have different names.  
 */
Page.prototype.getName = function() {
  return this.pageConfig.name;
};

/**
 * The init method is called before the pages are rendered. The method is called only once.
 */
Page.prototype.init = function() {
};

/**
 * Renders the page. This function might be called multiple times (depending on whether navigation is allowed and on the user behaviour)
 * @param {Object} _parent JQuery element which represent the parent DOM element where the content of the page must be stored.
 */
Page.prototype.render = function(_parent) {
  var table = $("<table align='center'></table>");
  _parent.append(table);

  for (var i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    var label = $("<td style='text-align: right; padding-right: 10px;'></td>");
    if (element.label) {
      label.append($("<strong>" + element.label + "</strong>"))
    }
    var widget = $("<td></td>");
    table.append($("<tr></tr>").append(label, widget));
    if (["text", "email", "password", "file"].includes(element.type)) {
      widget.append($("<input type='" + element.type + "' id='" + element.name + "' data-clear-btn='true'/>"));
    } else if (element.type === "number") {
      widget.append($("<input id='" + element.name + "' value='" + element.default + "' data-clear-btn='true' pattern='[\\d.,]+' data-inline='true'/>"));
    } else if (element.type === "long_text") {
      label.attr("id", "labeltd");
      label.attr("style", "vertical-align:top");
      widget.append($("<textarea name='" + element.name + "' id='" + element.name + "'></textarea>"));
    } else if (element.type === "date") {
      widget.append($("<input type='date' id='" + element.name + "' />"));
    } else if (element.type === "likert") {
      var likert = new LikertScale(element.response, element.name + "_", this.pageConfig.mustPlayback);
      likert.render(widget);
    } else if (element.type === "dropdown") {
      var dropdown = $("<select id='" + element.name + "'/>");
      for (var j = 0; j < element.response.length; ++j) {
        dropdown.append($("<option value='" + element.response[j].value + "'" + (element.response[j].selected===true?" selected=''":"") + ">" + element.response[j].label + "</option>"));
      }
      widget.append(dropdown);
    } else if (element.type === "checkbox") {
      widget.append($("<input type='checkbox' id='" + element.name + "' name='" + element.name + "_response' value='checked' style='margin-top: -16px; width: 100%' />"));
    } else if (element.type === "slider") {
      widget.append($("<input type='range' id='" + element.name + "' min='" + element.min + "' max='" + element.max + "' value='" + element.default + "' data-clear-btn='true' data-inline='true'/>"));
    } else if (element.type === "toggle") {
      var toggle = $("<select data-role='slider' id='" + element.name + "'/>");
      for (var j = 0; j < element.response.length; ++j) {
        toggle.append($("<option value='" + element.response[j].value + "'" + (element.response[j].selected===true?" selected=''":"") + ">" + element.response[j].label + "</option>"));
      }
      widget.append(toggle);
    }
    if (element.type !== "likert" && this.pageConfig.mustPlayback) {
      widget.children().prop("disabled", true);
    }
  }
};

/**
 * This method is called after the page is rendered. The purpose of this method is to load default values or saved values of the input controls. 
 */
Page.prototype.load = function() {
  if (this.pageConfig.questionnaire.length > 0) {
    this.pageTemplateRenderer.lockNextButton();
    this.interval = setInterval((function() {
      var counter = 0;
      var i;
      for (i = 0; i < this.pageConfig.questionnaire.length; ++i) {
        var element = this.pageConfig.questionnaire[i];
        if (element.type === "text") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "number") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "likert") {
          if ($("input[name='" + element.name + "__response']:checked").val() || element.optional == true) {
            ++counter;
          }
        } else if (element.type === "long_text") {
          if ($("#" + element.name).val() || element.optional == true) {
            ++counter;
          }
        }
      }
      if (counter == this.pageConfig.questionnaire.length) {
        this.pageTemplateRenderer.unlockNextButton();
        $('#send_results').removeAttr('disabled');
      } else {
        this.pageTemplateRenderer.lockNextButton();
      // } else if (i + 1 == this.pageConfig.questionnaire.length && counter != this.pageConfig.questionnaire.length && $('#send_results').is(':enabled')) {
        $('#send_results').prop('disabled', true);
      }
    }).bind(this), 50);
  }
};

/**
 * This method is called just before the next page is presented to the user. In case values of input controls are needed for rerendering, they must be saved within in method. 
 */
Page.prototype.save = function() {
  clearInterval(this.interval);
  for (var i = 0; i < this.pageConfig.questionnaire.length; ++i) {
    var element = this.pageConfig.questionnaire[i];
    
    if($("#" + element.name).val()){
      this.questionnaireResponses[element.name] = $("#" + element.name).val(); 
    } else { 
      this.questionnaireResponses[element.name] = $("input[name='"+element.name + "_response']:checked").val();
    }
  }
};

/**
 * @param {ResponsesStorage} _reponsesStorage
 */
Page.prototype.store = function(_reponsesStorage) {
  if (_reponsesStorage !== undefined) {
    Object.assign(_reponsesStorage, this.questionnaireResponses);
  }
};
