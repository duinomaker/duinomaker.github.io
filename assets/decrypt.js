function decryptAll() {
    const input_bar = document.getElementById('password')
    const decrypt_button = document.getElementById('decrypt')
    const key_text = (input_bar.value + '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000a\u000b\u000c\u000d\u000e\u000f').substring(0, 16)
    const digest = CryptoJS.SHA256('Are you kidding me?' + new Array(129).join(key_text + document.title) + "Yeah, but I'm actually serious.").toString()
    if (digest !== input_bar.getAttribute('digest')) {
        decrypt_button.classList.add('is-danger')
        input_bar.classList.add('is-danger')
        input_bar.value = ''
        input_bar.setAttribute('placeholder', 'Try again')
        return
    }
    const key = CryptoJS.enc.Utf8.parse(key_text)
    Array.from(document.getElementsByClassName('encrypted')).map(el => {
        const iv = CryptoJS.enc.Utf8.parse(el.getAttribute('iv'))
        const ciphertext = CryptoJS.enc.Hex.parse(el.innerHTML.replace(/\s/g, '')).toString(CryptoJS.enc.Base64)
        const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        })
        el.innerHTML = decrypted.toString(CryptoJS.enc.Utf8)
        el.setAttribute('class', 'decrypted')
    })
    decrypt_button.setAttribute('disabled', '')
    input_bar.setAttribute('disabled', '')
    decrypt_button.classList.remove('is-danger')
    input_bar.classList.remove('is-danger')
    input_bar.setAttribute('placeholder', 'Unlocked')
    input_bar.value = ''
    document.getElementById('input-bar-icon').classList.replace('fa-lock', 'fa-unlock')
}

document.getElementById('decrypt').removeAttribute('disabled')