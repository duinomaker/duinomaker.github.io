const input_bar = document.getElementById('cipher')
const output_bar = document.getElementById('out')
const dict = '\u200b\ufeff'

function stringToCipher(str, dict) {
    let hex = CryptoJS.enc.Utf8.parse(str).toString(CryptoJS.enc.Hex)
    let bytes = new Array
    for (let i = 0; i < hex.length; i += 2)
        bytes.push(parseInt(hex[i], 16) * 16 + parseInt(hex[i + 1], 16))
    let result = ''
    for (let i = 0; i < bytes.length; ++i) {
        let tmp = '', t = bytes[i]
        for (let j = 0; j < 8; ++j) {
            tmp = dict[t % 2] + tmp
            t = Math.floor(t / 2)
        }
        result += tmp
    }
    if (result.length)
        return dict[0] + result
    return ''
}

function cipherToString(cipher, dict) {
    let bits = Array.from(cipher).map((x) => (x == dict[0] ? 0 : 1))
    let bytes = new Array
    for (let i = 0, i_ = (bits.length - 1) / 8; i < i_; ++i) {
        let tmp = 0
        for (let j = 0; j < 8; ++j)
            tmp = tmp * 2 + bits[i * 8 + j + 1]
        bytes.push(tmp)
    }
    let hex = ''
    for (let i = 0; i < bytes.length; ++i)
        hex += bytes[i].toString(16)
    return CryptoJS.enc.Hex.parse(hex).toString(CryptoJS.enc.Utf8)
}

function encode() {
    output_bar.innerHTML = stringToCipher(input_bar.value, dict)
}

function decode() {
    const regex = new RegExp(`[${dict[0]}${dict[1]}]`, 'g')
    let cipher = input_bar.value.match(regex)
    if (cipher == null)
        output_bar.innerHTML = '无隐藏内容'
    else if ((cipher.length - 1) % 8)
        output_bar.innerHTML = '编码格式有误'
    else
        output_bar.innerHTML = cipherToString(cipher.join(''), dict)
}

const clipboard = new ClipboardJS("#encode")
clipboard.on('success', function (e) {
    if (output_bar.innerHTML == '')
        output_bar.innerHTML = '请输入需要编码的内容'
    else
        output_bar.innerHTML = '编码后的内容已复制到剪贴板'
})
clipboard.on('error', function (e) {
    if (output_bar.innerHTML == '')
        output_bar.innerHTML = '请输入需要编码的内容'
    else
        output_bar.innerHTML = '[' + output_bar.innerHTML + '] 复制失败，请手动复制中括号中的内容'
})

document.getElementById('decode').removeAttribute('disabled')
document.getElementById('encode').removeAttribute('disabled')