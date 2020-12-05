


let submitted =async()=>{
  if(auth2 && auth2.isSignedIn.get()==true && verified){
    let form = document.getElementsByClassName('form')[0]
    let url = form.url.value
    let slug = form.slug.value
    
    await fetch('/url', {
        method: 'POST',
        mode: 'cors',
        credentials: 'same-origin', 
        headers: { 'Content-Type': 'application/json'},
        redirect: 'follow',
        body: JSON.stringify({url,slug})
      })
      .then(res=> res.json()).then(x=>{if(x.message)alert(x.message);else alert("link created at "+`https://links.bhushan.fun/${slug}`)})
  }
  else if(!verified){
    alert("You are not allowed")
  }
  else{
    alert("You are not signed in!!")
  }
}

