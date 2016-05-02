/**
 * This file should only be loaded after the DOM.
 **/
var tab = document.getElementById('tab');
var metadata = document.getElementById('metadata');
var editor = CodeMirror.fromTextArea(tab, {
  lineNumbers: true,
  keyMap: 'vim'
});
var metadataEditor = CodeMirror.fromTextArea(metadata, {
  lineNumbers: true,
  keyMap: 'vim'
});

// This localStorage persistence is based on Gozala/codemirror-persist
var tabAddress = window.location.href.split("#")[0] + "tab";
var metadataAddress = window.location.href.split("#")[0] + "metadata";

var tabPersisted = localStorage[tabAddress] || editor.getValue();
editor.setValue(tabPersisted);

var metadataPersisted = localStorage[metadataAddress] || metadataEditor.getValue();
metadataEditor.setValue(metadataPersisted);

// Store updates to local storage.
editor.on('change', function(editor) {
  localStorage[tabAddress] = editor.getValue()
});

metadataEditor.on('change', function(editor) {
  localStorage[metadataAddress] = editor.getValue()
});
