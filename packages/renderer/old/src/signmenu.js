{
    let dimensions = {
        // Picture Frames
        "sign.pictureframe.landscape": { width: 256, height: 128 }, // Landscape Picture Frame
        "sign.pictureframe.portrait": { width: 128, height: 256 },  // Portrait Picture Frame
        "sign.pictureframe.tall": { width: 128, height: 512 },      // Tall Picture Frame
        "sign.pictureframe.xl": { width: 512, height: 512 },        // XL Picture Frame
        "sign.pictureframe.xxl": { width: 1024, height: 512 },      // XXL Picture Frame
        
        // Wooden Signs
        "sign.wooden.small": { width: 128, height: 64 },  // Small Wooden Sign
        "sign.wooden.medium": { width: 256, height: 128 },// Wooden Sign
        "sign.wooden.large": { width: 256, height: 128 }, // Large Wooden Sign
        "sign.wooden.huge": { width: 512, height: 128 },  // Huge Wooden Sign
    
        // Banners
        "sign.hanging.banner.large": { width: 64, height: 256 }, // Large Banner Hanging
        "sign.pole.banner.large": { width: 64, height: 256 },    // Large Banner on Pole
    
        // Hanging Signs
        "sign.hanging": { width: 128, height: 256 },         // Two Sided Hanging Sign
        "sign.hanging.ornate": { width: 256, height: 128 },  // Two Sided Ornate Hanging Sign
    
        // Town Signs
        "sign.post.single": { width: 128, height: 64 },     // Single Sign Post
        "sign.post.double": { width: 256, height: 256 },    // Double Sign Post
        "sign.post.town": { width: 256, height: 128 },      // One Sided Town Sign Post
        "sign.post.town.roof": { width: 256, height: 128 }, // Two Sided Town Sign Post
    
        // "photoframe.large": { width: 320, height: 240 },
        // "photoframe.portrait": { width: 320, height: 384 },
        // "photoframe.landscape": { width: 320, height: 240 },
    
        // Other paintable assets
        // "spinner.wheel.deployed": { 512, 512, 285, 285 }, // Spinning Wheel
    };

    let sign_icon = document.querySelector('#sign-icon')
    let sign_menu = document.querySelector('#sign-menu')

    sign_icon.addEventListener('click', (e) => {
        if(e.target != sign_icon) return;

        if(!sign_menu.classList.contains('sign-menu-visible')) {
            sign_menu.classList.add('sign-menu-visible')
            sign_menu.classList.remove('sign-menu-hidden')
            sign_icon.classList.add('sign-icon-transparent')
        }
    })

    function getSizeOfImage(url) {
        return dimensions[url.slice(0, -4)]
    }

    let list = window.Access.getSigns()
    for(let index in list) {
        let disabled = !getSizeOfImage(list[index])

        let element = document.createElement('div')
        element.style.backgroundImage = 'url(signs/' + list[index] + ')'
        if(!disabled) {
            element.classList.add('sign-menu-item')
            element.addEventListener('click', (e) => {
                sign_icon.classList.remove('sign-icon-transparent')
                sign_menu.classList.remove('sign-menu-visible')
                sign_menu.classList.add('sign-menu-hidden')

                sign_icon.style.backgroundImage = 'url(signs/' + list[index] + ')'
                let size = getSizeOfImage(list[index])
                if(size) {
                    /*
                    let wcw = window.innerWidth / 2
                    let wch = window.innerHeight / 2

                    rect.x_min = wcw - size.width / 2
                    rect.x_max = wcw + size.width / 2
                    rect.y_min = wch - size.height / 2
                    rect.y_max = wch + size.height / 2
                    updateBoxStyle()
                    */
                }
            })
        } else {
            element.classList.add('sign-menu-item-disabled')
        }

        sign_menu.appendChild(element)
    }
}