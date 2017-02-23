import Api from '../api/Api';
import { isString } from '../lib/check';


/**
 * @class UserSettings
 *
 * @description
 * Handles communication with the userSettings endpoint. Can be used to get or save userSettings.
 */

class UserSettings {
    constructor(userSettings, api = Api.getApi()) {
        this.api = api;

        if (userSettings) {
            Object.assign(this, userSettings);
        }
    }

    /**
     * @method all
     *
     * @returns {Promise} Promise that resolves with the usersettings object from the api.
     *
     * @description
     * Loads all the user settings of current user and returns them as an object from the promise.
     * ```js
     * d2.currentUser.userSettings.all()
     *  .then(userSettings => {
     *    console.log('UI Locale: ' + userSettings.keyUiLocale);
     *  });
     * ```
     */
    all() {
        return this.api.get('userSettings');
    }

    /**
     * @method get
     *
     * @param {String} key The identifier of the user setting that should be retrieved.
     * @returns {Promise} A promise that resolves with the value or will fail if the value is not available.
     *
     * @description
     * ```js
     * d2.currentUser.userSettings.get('keyUiLocale')
     *  .then(userSettingValue => {
     *    console.log('UI Locale: ' + userSettingValue);
     *  });
     * ```
     */
    get(key) {
        function processValue(value) {
            // Attempt to parse the response as JSON. If this fails we return the value as is.
            try {
                return JSON.parse(value);
            } catch (e) {
                return value;
            }
        }

        return new Promise((resolve, reject) => {
            if (!isString(key)) {
                throw new TypeError('A "key" parameter should be specified when calling get() on userSettings');
            }

            this.api.get(['userSettings', key].join('/'), undefined, { dataType: 'text' })
                .then((response) => {
                    const value = processValue(response);
                    // Store the value on the user settings object
                    this[key] = value;
                    if (value) {
                        resolve(processValue(response));
                    }
                    reject(new Error('The requested userSetting has no value or does not exist.'));
                });
        });
    }

    /**
     * @method set
     *
     * @param {String} key The identifier of the user setting that should be saved.
     * @param {String} value The new value of the user setting.
     * @returns {Promise} A promise that will resolve when the new value has been saved, or fail if saving fails.
     *
     * @description
     * ```js
     * d2.currentUser.userSettings.set('keyUiLocale', 'fr')
     *  .then(() => {
     *   console.log('UI Locale is now "fr");
     *  });
     * ```
     */
    set(key, value) {
        const settingUrl = ['userSettings', key].join('/');
        if (value === null || (`${value}`).length === 0) {
            return this.api.delete(settingUrl, { dataType: 'text' })
                .then(this[key] = undefined);
        }
        return this.api.post(settingUrl, value, { dataType: 'text', contentType: 'text/plain' })
            .then(this[key] = value);
    }
}

export default UserSettings;
