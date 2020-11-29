


let submitted =async()=>{
    let form = document.getElementsByClassName('form')[0]
    let url = form.url.value
    let slug = form.slug.value
    console.log(url,slug)
    await fetch('/url', {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin', 
        headers: { 'Content-Type': 'application/json'},
        redirect: 'follow',
        body: JSON.stringify({url,slug})
      })
      .then(res=>res.json()).then(x=>{if(x.message)alert(x.message)})
}