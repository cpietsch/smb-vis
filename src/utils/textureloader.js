import { BaseTexture, Rectangle, Texture } from "pixi.js"


function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image;
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.crossOrigin = "anonymous";
        image.src = url;
    });
}

async function loadTexture(url) {
    const image = await loadImage(url);
    return BaseTexture.from(image, { width: image.naturalWidth, height: image.naturalHeight });
}

function extractSpriteTexture(texture, sprite) {
    const frame = new Rectangle(
        sprite.position.x + 1,
        sprite.position.y + 1,
        sprite.dimension.w - 2,
        sprite.dimension.h - 2
    );
    const orig = new Rectangle(
        0,
        0,
        sprite.dimension.w,
        sprite.dimension.h
    );
    return new Texture(texture, frame, orig, false, false);
}

export async function* getTextureStream(url) {

    console.log("getTextureStream")

    const baseUrl = url.substring(0, url.lastIndexOf('/')) + "/"
    const data = await fetch(url).then(r => r.json())

    const textures = [];
    const baseTextures = [];

    for (const sprites of data.spritesheets) {
        const baseTexture = await loadTexture(baseUrl + sprites.image);
        baseTextures.push(baseTexture);
        for (const spritedata of sprites.sprites) {
            const texture = extractSpriteTexture(baseTexture, spritedata);
            const tuple = [spritedata.name, texture]
            textures.push(tuple)
            yield tuple
        }
    }
}

