// let copySelected = document.getElementById("menu-copySelected")
// copySelected.addEventListener("mouseover",()=>{
//     let str = document.getSelection().toString()
//      try {
//     return navigator.clipboard
//       .writeText(str)
//       .then(() => {
//         return Promise.resolve()
//       })
//       .catch(err => {
//         return Promise.reject(err)
//       })
//   } catch (e) {
//     const input = document.createElement('input');
//     input.setAttribute('readonly', 'readonly');
//     document.body.appendChild(input);
//     input.setAttribute('value', str);
//     input.select();
//     try {
//       let result = document.execCommand('copy')
//       document.body.removeChild(input);
//       if (!result || result === 'unsuccessful') {
//         return Promise.reject('复制文本失败!')
//       } else {
//         return Promise.resolve()
//       }
//     } catch (e) {
//       document.body.removeChild(input);
//       return Promise.reject(
//         '当前浏览器不支持复制功能，请检查更新或更换其他浏览器操作!'
//       )
//     }
//   }
// })