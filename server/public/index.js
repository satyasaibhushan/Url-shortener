let submitted = async () => {
  if (auth2 && auth2.isSignedIn.get() == true && verified) {
    let form = document.getElementsByClassName("form")[0];
    let url = form.url.value;
    let slug = form.slug.value;

    await fetch("/url", {
      method: "POST",
      mode: "cors",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({ url, slug }),
    })
      .then(res => res.json())
      .then(x => {
        if (x.message) alert(x.message);
        else alert("link created at " + `https://links.bhushan.fun/${slug}`);
      });
  } else if (!verified) {
    alert("You are not allowed");
  } else {
    alert("You are not signed in!!");
  }
};

let getUrls = async () => {
  let table = document.getElementById("urlsTable");
  if (auth2 && auth2.isSignedIn.get() == true) {
    await fetch("/urls", {
      mode: "cors",
      credentials: "same-origin",
      redirect: "follow",
    })
      .then(res => res.json())
      .then(x => {
        if (x.length > 0) table.style.display = "";
        let row, cell1, cell2;
        let a, link;
        x.forEach(element => {
          row = table.insertRow();
          cell1 = row.insertCell(0);
          cell2 = row.insertCell(1);
          cell3 = row.insertCell(2);

          a = document.createElement("a");
          link = document.createTextNode("links.bhushan.fun/" + element.slug);
          a.appendChild(link);
          a.title = "links.bhushan.fun/" + element.slug;
          a.href = "https://links.bhushan.fun/" + element.slug;
          cell1.appendChild(a);

          a = document.createElement("a");
          link = document.createTextNode(element.url);
          a.appendChild(link);
          a.title = element.url;
          a.href = element.url;
          cell2.appendChild(a);

          a = document.createElement("div");
          link = document.createTextNode(element.count);
          a.appendChild(link);
          a.title = element.count;
          a.href = element.count;
          cell3.appendChild(a);

          let div = document.createElement("div");
          let x = document.createElement("IMG");
          x.src="./delete.svg";
          x.className="deleteIcon"
          div.className = "deleteIconDiv"
          div.appendChild(x);
          row.appendChild(div);
          div.onclick=()=>{
            deleteUrl(element.slug);
          }
        });
      });
  } else {
    alert("You are not allowed");
  }
};

deleteUrl=async(slug)=>{
  await fetch(`/delete/${slug}`, {
    mode: "cors",
    credentials: "same-origin",
    redirect: "follow",
  }).then(()=>{
    window.location.reload()
  })
}
