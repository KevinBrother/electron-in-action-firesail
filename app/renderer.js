const marked = require('marked');
const {remote, ipcRenderer} = require('electron');
// console.log(remote)
const mainProcess = remote.require('./main')

const markdownView = document.querySelector('#markdown');
const htmlView = document.querySelector('#html');
const newFileButton = document.querySelector('#new-file');
const openFileButton = document.querySelector('#open-file');
const saveMarkdownButton = document.querySelector('#save-markdown');
const revertButton = document.querySelector('#revert');
const saveHtmlButton = document.querySelector('#save-html');
const showFileButton = document.querySelector('#show-file');
const openInDefaultButton = document.querySelector('#open-in-default');

markdownView.addEventListener('keyup', (event)=>{
    const currentContent = event.target.value;
    renderMarkdownToHtml(currentContent);
})

const renderMarkdownToHtml = (markdown) => {
    htmlView.innerHTML = marked(markdown, {sanitize: true});
}

openFileButton.addEventListener('click', () => {
    mainProcess.getFileFromUser();
})

ipcRenderer.on('file-opened', ((event, args) => {
    console.log(event, args);
    const {file, content} = args[0];
    markdownView.value = content;
    renderMarkdownToHtml(content)
}))
