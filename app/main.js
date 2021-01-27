const {app, BrowserWindow, dialog, Menu} = require('electron');
const applicationMenu = require('./application-menu');
const fs = require('fs');

let mainWindow;
let windows = new Set();

const createWindow = exports.createWindow = () => {
    let x, y;
    const currentWindow = BrowserWindow.getFocusedWindow();
    if(currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition();
        x = currentWindowX + 10;
        y = currentWindowY + 10;
    }


    let newWindow = new BrowserWindow({
        x,
        y,
        webPreferences: {
            /*首次创建窗口先隐藏*/
            show: false,
            /*添加对渲染进程的node框架支持*/
            // TODO 把这关闭，设置html的Content-Security-Policy看看有没有用
            nodeIntegration: true,
            // 允许使用remote中模块
            enableRemoteModule: true,
            // TODO 中文乱码
            defaultEncoding: 'UTF-8',
        }
    });

    // TODO 这个loadFile路径很奇怪
    newWindow.loadFile('app/index.html')
        .catch(err => {
            console.log('loadFile index.html fail', err)
        })


    newWindow.once('ready-to-show', () => {
        newWindow.show();
    })


    newWindow.on('closed', () => {
        windows.delete(newWindow);
    })

    windows.add(newWindow);
    return newWindow;
}

const getFileFromUser = exports.getFileFromUser =  (targetWindow) => {
    dialog.showOpenDialog(targetWindow, {
        properties: ['openFile'],
        filters: [
            {name: 'Text Files',extensions:['txt']},
            // TODO 不支持md格式的文件啊 为啥
            {name: 'Markdown Files',extensions:['md']},
        ]
    }).then(files => {
        // console.log(files)
        const filePaths = files.filePaths;
        if(files.filePaths.length === 0) {
            return
        };

        openFile(targetWindow, filePaths)
    })
}

const openFile = (targetWindow, filePaths) => {
    const file = filePaths[0];
    let content = fs.readFileSync(file).toString();
    console.log(content);
    targetWindow.webContents.send('file-opened', [{file, content}]);
}

app.on('ready', ()=> {
    console.log('electron is ready 准备了 !!!')
    Menu.setApplicationMenu(applicationMenu);
    mainWindow = createWindow();
})

app.on('window-all-closed', () => {
    if(process.platform === 'darwin') {
        return false
    }

    app.quit()
})

// 只有macOS有效，Windows和Linux的需要另外方法实现
app.on('activate', (event, hasVisibleWindows) => {
    if(!hasVisibleWindows) {
        createWindow();
    }
})

