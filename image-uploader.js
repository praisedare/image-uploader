
const ImageUploadComponent = (() => {
    function createElem() {
        let $elem = document.createElement('div');
        $elem.className = 'img-upload-component';
        $elem.style = 'position: relative; display: inline-block; width: 100%; max-width: 250px; border: 1px solid lightgrey; border-radius: 2px;';
        $elem.innerHTML = `
            <div class="image-area" style="position: relative; height: 200px; overflow: hidden;">
                <button class="close-btn" type="button" style="position: absolute; right: 5px; top: 5px; z-index: 2; border: 0; background-color: #e60000; color: white; font-weight: bolder; border-radius: 3px; line-height: 1em; font-size: 15px; font-family: monospace; height: 24px; width: 24px;">&times;</button>
                <div class="image-container" style="position: absolute; width: 100%; height: 200px; display: flex; align-items: center; justify-content: center;">
                    <img class="img-preview" style="width: 100%; height: 100%; object-fit: contain; padding: 10px; box-sizing: border-box;"/>
                </div>
                <input type="file" style="display: none;"/>
                <input type="hidden" name="image-changed" class="image-changed" value="0"/>
                <div class="hover-msg" style="user-select: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-content: center; align-items: center; justify-content: center; text-align: center; background-color: rgba(0, 0, 0, 0.5); transition: 0.35s; opacity: 0; color: white; text-shadow: 0 1px 1px black; font-size: 12px;"><span>Click to select image</span></div>
            </div>
            <ul class="img-errors" style="display: none; list-style-type: none; margin: 0; padding: 10px; color: tomato;"></ul>
        `;
        return $elem;
    }

    function addEventListeners($elem) {
        $elem.addEventListener('click', (e) => {
            if (e.target.matches('button.close-btn')) return;
            $elem.querySelector('input[type="file"]').click()
        });
        $elem.querySelector('input[type="file"]').addEventListener('input', e => previewImage($elem));
        $elem.querySelector('.close-btn').addEventListener('click', () => {
            clearImage($elem);
            if ($elem._config.removeImageOnClear) $elem.remove();
        });
        $elem.addEventListener('mouseenter', (e) => {
            if (e.target !== $elem) return;
            $elem.querySelector('.hover-msg').style.opacity = '1';
        });
        $elem.addEventListener('mouseleave', (e) => {
            if (e.target !== $elem) return;
            $elem.querySelector('.hover-msg').style.opacity = '0';
        });
    }

    const setProto = (() => {
        const proto = Object.create(HTMLDivElement.prototype, Object.getOwnPropertyDescriptors({
            get _fileInput() { return this.querySelector('input[type="file"]'); },
            get _fileChangedInput() { return this.querySelector('input[type="hidden"]'); },

            set _imageSrc(src) {
                src = src.trim();
                if (! src)
                    return;
                this.querySelector('img').src = src;
            },
            set _imgSrc(src) { return this._imageSrc = src; },

            set _defaultSrc(src) {
                this.dataset.defaultSrc = src;
            },
        }));

        return ($elem, config) => {
            Object.setPrototypeOf($elem, proto);
            Object.defineProperty($elem, '_config', {
                get() {
                    return config;
                },
            });
        };
    })();
    

	/**
	 * @typedef {object} ImgUploadComponentConfig
	 * Contains the configurations to be applied to the Image Upload Component
	 * that will be created.
	 * @property {boolean} removeImageOnClear Determines whether the component should also
	 *										be removed when the image is cleared.
	 * @property {number} maxSize			 The maximum size (in kilobytes) of the uploaded image.
	 * @property {string[]|string} types			 The allowed mime types
	 */
	let controlObj = {
		/**
		 * Creates an image upload field with image preview.
		 * @param {ImgUploadComponentConfig} config Contains information about images allowed e.g. `maxSize` for file size e.t.c
		 */
		create(config = {}) {
			if (! config.maxSize || config.maxSize > Number.MAX_SAFE_INTEGER) config.maxSize = Infinity;
			if (! config.types) config.types = '*'

            let $elem = createElem();

            setProto($elem, config);

            addEventListeners($elem);

			clearImage($elem);

			setTimeout(() => {
				// Clear cached browser input
				$elem._fileChangedInput.value = '0';
			});

			return $elem;
		},
	}

	/**
	 * Removes the preview image and clears the file input field.
	 * @param {HTMLDivElement} imgComponent The element returned by the create method of the IMG_UPLOAD_COMPONENT class
	 */
	function clearImage(imgComponent) {
		imgComponent.querySelector('.img-preview').src = imgComponent.dataset.defaultSrc || 'data:image/png;base64,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';
		imgComponent.querySelector('input[type="file"]').value = '';
		imgComponent.querySelector('input[type="file"]').dispatchEvent(new CustomEvent('change'));
		imgComponent.querySelector('input.image-changed').value = '1';
		URL.revokeObjectURL(imgComponent.dataset.imgUrl);
	}

	/**
	 * Displays an image in its Image Upload Component
	 * @param {HTMLInputElement} imgInput The input element that contains the file to be previewed
	 * @param {ImgUploadComponentConfig} config
	 * @returns {void}
	 */
	function previewImage($imgComponent) {
        let imgInput = $imgComponent._fileInput;
		let imgFile = imgInput.files[0],
			uploadContainer = imgInput.closest('.img-upload-component'),
			imgPreview = uploadContainer.querySelector('img'),
			errorList = uploadContainer.querySelector('.img-errors'),
			errors;

		errorList.style.display = 'none';

		if (! imgFile ) {
			clearImage(uploadContainer);
			return;
		};

		errors = validatePhoto(imgFile, $imgComponent._config);
		if ( errors.length ) {
			clearImage(uploadContainer);
			displayErrors(errors);
			return;
		};

		URL.revokeObjectURL(uploadContainer.dataset.imgUrl);
		uploadContainer.dataset.imgUrl =  URL.createObjectURL(imgFile);
		imgPreview.src = uploadContainer.dataset.imgUrl;

		uploadContainer.querySelector('input.image-changed').value = "1";

		function displayErrors(errors) {
			while (errorList.firstElementChild) errorList.firstElementChild.remove();

			for (let error of errors) {
				errorList.innerHTML += "<li>" + error + "</li>";
			}

			errorList.style.display = '';
		}

		/**
		 * Validates an image file using the rules defined in an Image Upload
		 * Component Configuration Object.
		 * @param {File} photo The image file to be previewed
		 * @param {ImgUploadComponentConfig} config
		 * @returns
		 */
		function validatePhoto(photo, config) {
			let errors = [],
				mimes = (() => {
					if (config.types == '*') return '*';
					let r = [];
					for (let type of config.types)
						r.push(`image/${ type }`);
					return r;
				})(),
				maxSize = (() => {
					if (config.maxSize == Infinity) return;
					let r = ['KB', 'MB', 'GB'],
						size = config.maxSize,
						mod = 0,
						fraction;
					while (size > 1) {
						mod += (size /= 1024) >= 1 ? 1 : 0;
						if (mod + 1 == r.length) break;
					}

					[size, fraction] = (size *= 1024).toFixed(1).split('.');
					fraction = fraction == '.0' ? '' : '.' + fraction;

					return `${size + fraction}${r[mod]}`;
				})();
			if (photo.size / 1024 > config.maxSize) {
				errors.push(`File should not be more than ${ maxSize }.`);
			}
			if ((mimes == '*' && !photo.type.startsWith('image/')) || (mimes !== '*' && ! mimes.includes(photo.type)) ) {
				errors.push('File must be an image' + (mimes !== '*' ? ` of types: ${ config.types.join(', ') }.` : ''));
			}

			return errors;
		}
	}

	return controlObj;
})();


