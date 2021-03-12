document.querySelector('#btnClose').addEventListener('click', (e) => window.Access.close());
document.querySelector('#btnSize').addEventListener('click', (e) => window.Access.maximize());

{
    let list = document.getElementsByTagName('a');
    for(i = 0; i < list.length; i++) {
        let item = list.item(i);

        item.addEventListener('click', (e) => {
            e.preventDefault();
            window.Access.openBrowserLink(item.href);
        });
    }
}