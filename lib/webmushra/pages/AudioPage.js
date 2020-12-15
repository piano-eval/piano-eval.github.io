/*************************************************************************
         (C) Copyright AudioLabs 2017 

This source code is protected by copyright law and international treaties. This source code is made available to You subject to the terms and conditions of the Software License for the webMUSHRA.js Software. Said terms and conditions have been made available to You prior to Your download of this source code. By downloading this source code You agree to be bound by the above mentionend terms and conditions, which can also be found here: https://www.audiolabs-erlangen.de/resources/webMUSHRA. Any unauthorised use of this source code may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under law. 

**************************************************************************/

AudioPage.prototype = Object.create(Page.prototype);
AudioPage.prototype.constructor = AudioPage;

/**
* @class AudioPage
*/
function AudioPage(_pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender, _audioContext, _bufferSize, _audioFileLoader, _errorHandler) {
  Object.getPrototypeOf(AudioPage.prototype).constructor.call(this, _pageManager, _pageTemplateRenderer, _pageConfig, _session, _language, _dataSender);
  this.audioContext = _audioContext;
  this.bufferSize = _bufferSize;
  this.audioFileLoader = _audioFileLoader;
  this.errorHandler = _errorHandler;
  this.audioFiles = [];
};

AudioPage.prototype.addAudioFile = function(_stimulusObject) {
  this.audioFiles.push(_stimulusObject);
  // this.audioFileLoader.addFile(_stimulusObject.getFilepath(), (function (_buffer, _stimulus) { _stimulus.setAudioBuffer(_buffer); }), _stimulusObject);
};

AudioPage.prototype.loadAudioFiles = function(_callback) {
  for (var audioFile of this.audioFiles) {
    this.audioFileLoader.addFile(audioFile.getFilepath(), (function (_buffer, _stimulus) { _stimulus.setAudioBuffer(_buffer); }), audioFile);
  }
  this.audioFileLoader.startLoading(function() {this.audioFileLoader.finishLoading(); _callback();});
};
