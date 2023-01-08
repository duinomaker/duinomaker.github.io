const input_bar = document.getElementById('password')
const output_bar = document.getElementById('out')

function stringToBytes(str) {
    var bytes = new Array()
    var len, c
    len = str.length
    for (var i = 0; i < len; i++) {
        c = str.charCodeAt(i)
        if (c >= 0x010000 && c <= 0x10FFFF) {
            bytes.push(((c >> 18) & 0x07) | 0xF0)
            bytes.push(((c >> 12) & 0x3F) | 0x80)
            bytes.push(((c >> 6) & 0x3F) | 0x80)
            bytes.push((c & 0x3F) | 0x80)
        } else if (c >= 0x000800 && c <= 0x00FFFF) {
            bytes.push(((c >> 12) & 0x0F) | 0xE0)
            bytes.push(((c >> 6) & 0x3F) | 0x80)
            bytes.push((c & 0x3F) | 0x80)
        } else if (c >= 0x000080 && c <= 0x0007FF) {
            bytes.push(((c >> 6) & 0x1F) | 0xC0)
            bytes.push((c & 0x3F) | 0x80)
        } else {
            bytes.push(c & 0xFF)
        }
    }
    return bytes
}

function bytesToString(arr) {
    if (typeof arr === 'string') {
        return arr
    }
    var str = '', _arr = arr
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2), v = one.match(/^1+?(?=0)/)
        if (v && one.length == 8) {
            var bytesLength = v[0].length
            var store = _arr[i].toString(2).slice(7 - bytesLength)
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2)
            }
            str += String.fromCharCode(parseInt(store, 2))
            i += bytesLength - 1
        } else {
            str += String.fromCharCode(_arr[i])
        }
    }
    return str
}

function encode() {
    let str = input_bar.value
    let length = stringToBytes(str).length
    if (length % 4)
        str = str.padEnd(Math.ceil(length / 4) * 4, '\0')
    let bytes = stringToBytes(str)
    let groups = length / 4
    let result = []
    for (let i = 0; i < groups; ++i) {
        let tmp = 0
        for (let j = 0; j < 4; ++j)
            tmp = tmp * 256 + bytes[i * 4 + j]
        for (let j = 0; j < 14; ++j) {
            result = [226, 128, 139 + (tmp % 5)].concat(result)
            tmp = Math.floor(tmp / 5)
        }
    }
    output_bar.innerHTML = bytesToString(result)
}

function decode() {
    let data = input_bar.value.match(/[\u200b\u200c\u200d\u200e\u200f]/g)
    if (data == null || data.length % 14) {
        output_bar.innerHTML = '无隐藏信息或是格式错误'
        return
    }
    let cipher = data.map((c) => (c.charCodeAt(0) - 8203))
    let result = []
    let groups = cipher.length / 14
    for (let i = 0; i < groups; ++i) {
        let tmp = 0
        for (let j = 0; j < 14; ++j)
            tmp = tmp * 5 + cipher[i * 14 + j]
        for (let j = 0; j < 4; ++j) {
            result = [tmp % 256].concat(result)
            tmp = Math.floor(tmp / 256)
        }
    }
    output_bar.innerHTML = bytesToString(result)
}

document.getElementById('decode').removeAttribute('disabled')
document.getElementById('encode').removeAttribute('disabled')

var clipboard = new ClipboardJS("#encode")
clipboard.on('success', function (e) {
    if (output_bar.innerHTML == '')
        output_bar.innerHTML = '请输入需要编码的内容'
    else
        output_bar.innerHTML = '编码后的内容已复制到剪贴板'
})
clipboard.on('error', function (e) {
    output_bar.innerHTML = '[' + output_bar.innerHTML + '] 复制失败，请手动复制中括号中的内容'
})