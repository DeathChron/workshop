const element = document.getElementById("dialog")
const dialog = new A11yDialog(element)

function OpenDialog(data) {
    console.log(data)
    document.getElementById("dialog-title").innerHTML = data.name;
    document.getElementById("dialog-description").innerHTML = data.description;
    document.getElementById("dialog-href").setAttribute("href", data.url);
    dialog.show()
};