// The previewer is now a reusable single element that can get injected into the file picker
class ImagePreviewer {
    #element = null;
    #image = null;
    #url = null;

    // "Singleton" instantiation
    getInstance() {
        if (this.#element)
            return this.#element;

        this.#image = document.createElement("img");

        this.#image.addEventListener("load", () => {
            const aspectRatio = this.#image.naturalWidth / this.#image.naturalHeight;
            this.#image.style.setProperty("--aspectRatio", aspectRatio);
        });

        this.#image.addEventListener("error", () => this.hoverOff());

        this.#element = document.createElement("div");
        this.#element.classList.add("image-previewer");
        this.#element.append(this.#image);
        document.body.append(this.#element);

        return this.#element;
    }

    showPreview(imageUrl, rowElement) {
        const previewer = this.getInstance();

        if (this.#url !== imageUrl) {
            this.#url = imageUrl;
            this.#image.src = imageUrl;
        }

        const anchorClass = "image-previewer-anchor";
        document.querySelector(`.${anchorClass}`)?.classList.remove(anchorClass);
        rowElement.classList.add(anchorClass);
        previewer.classList.add("active");
    }

    hoverOff() {
        this.#element?.classList.remove("active");
    }

    moveToEnd() {
        if (this.#element)
            document.body.append(this.#element);
    }
}

const previewer = new ImagePreviewer();

function initialiseImagePreviewer(root) {
    // Ensure the previewer is always at the bottom of the DOM so all anchors can be found
    previewer.moveToEnd();

    root.addEventListener("mouseover", event => {
        const file = event.target.closest?.("li.file[data-path]");

        if (!file)
            return;

        const path = file.dataset.path;

        if (!foundry.helpers.media.ImageHelper.hasImageExtension(path)) {
            previewer.hoverOff();

            return;
        }

        previewer.showPreview(path, file);
    });

    root.addEventListener("mouseout", event => {
        const file = event.target.closest?.("li.file[data-path]");

        if (!file || (event.relatedTarget && file.contains(event.relatedTarget)))
            return;

        previewer.hoverOff();
    });

    console.log("Image Previewer Resurrected | Initialised");
}

Hooks.once("init", () => console.log("Image Previewer Resurrected | Initialising..."));

// ApplicationV2 uses HTMLElement objects instead of jquery html
Hooks.on("renderFilePicker", (_, element) => {
    if (!(element instanceof HTMLElement))
        return;

    if (element.dataset.imagePreviewer === "active")
        return;

    element.dataset.imagePreviewer = "active";

    initialiseImagePreviewer(element);
});

Hooks.on("closeFilePicker", () => previewer.hoverOff());
