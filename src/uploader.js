import {
    read,
    write,
    destroy
} from './localStorage';


import { v4 as uuidv4 } from 'uuid';

window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;

const uploadFile = file => {

    return new Promise((resolve, reject) => {

        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
            fs.root.getFile(`${file.name}${uuidv4()}`, { create: true, exclusive: true }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.write(file);
                    resolve(fileEntry);
                }, e => console.log(e));
            }, e => console.log(e));
        })

    })

}

const fileEntryPathToObjectUrl = async fileEntryPath => {
    return URL.createObjectURL(await new Promise((resolve, reject) => {
        window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function(fs) {
            fs.root.getFile(fileEntryPath, { create: true, exclusive: false }, function(fileEntry) {
                fileEntry.file(resolve, reject)
            }, e => console.log(e));
        })
    }))
}

const uploader = (submitSelector, imagesListSelector) => {

    const submit = document.querySelector(submitSelector);
    const imagesList = document.querySelector(imagesListSelector);


    const syncImages = () => {

        while (imagesList.firstChild) {
            imagesList.removeChild(imagesList.firstChild);
        }

        read().forEach(async image => {

            const imageContainer = document.createElement('div');
            const label = document.createElement('input');
            const imageElement = document.createElement('img');
            //status
            const deleteLink = document.createElement('a');
            imageContainer.classList.add('image-container');
            deleteLink.classList.add('cerrar');
            imageElement.classList.add('card-img-top');
            imageContainer.id = image.id;
            deleteLink.href = '#';
            deleteLink.innerText = 'x';
            //status classlist

            imageElement.src = await fileEntryPathToObjectUrl(image.path);
            label.value = image.name;

            deleteLink.addEventListener('click', e => {

                e.preventDefault();
                destroy(image.id);
                syncImages();

            });


            imageContainer.appendChild(deleteLink);

            imageContainer.appendChild(imageElement);

            imageContainer.appendChild(label);

            imagesList.appendChild(imageContainer);


        });


    }

    submit.addEventListener('change', async e => {

        const fileEntry = await uploadFile(e.target.files[0]);

        write([
            ...read(),
            {
                id: uuidv4(),
                path: fileEntry.fullPath,
                name: (uuidv4()).toString()
            }
        ])
        syncImages();

    })
    syncImages();

}

export default uploader;