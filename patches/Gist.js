const Provider = require('./Provider');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const rangeParser = require('parse-numeric-range');
const querystring = require('querystring');
const _ = require('lodash');

class Gist extends Provider {
    constructor(options) {
        super(options);
        this.regexp = /https:\/\/gist.github.com\/(.*)\/([a-f0-9]+)/i;
        this.idPosition = 2;
        this.template = __dirname + '/../templates/Gist.hbs';
        this.options = _.defaults(options, {});
    }

    /**
     * Validates the query object is valid.
     *
     * @source https: //github.com/weirdpattern/gatsby-remark-embed-gist
     *
     * @param {GistQuery} query the query to be validated.
     * @returns {boolean} true if the query is valid; false otherwise.
     */
    isValid(query) {
        if (query == null) return false;
        if (query.file == null && query.highlights == null) return false;

        // leaving this for future enhancements to the query object

        return true;
    }

    /**
     * Builds the query object.
     * This methods looks for anything that is after ? or # in the gist: directive.
     * ? is interpreted as a query string.
     * # is interpreted as a filename.
     *
     * @source https: //github.com/weirdpattern/gatsby-remark-embed-gist
     *
     * @param {string} value the value of the inlineCode block.
     * @returns {object} the query object.
     */
    getQuery(embedLink) {
        const [, qs] = embedLink.split(/[?#]/);

        // if there is no file, then return an empty object
        if (qs == null) return {
            highlights: []
        };

        // if # is used, then force the query object
        const query = embedLink.indexOf("#") > -1 ? {
            file: qs
        } : querystring.parse(qs);

        // validate the query
        if (!this.isValid(query)) {
            throw new Error("Malformed query. Check your gist url");
        }

        // explode the highlights ranges, if any
        let highlights = [];
        if (typeof query.highlights === "string") {
            highlights = rangeParser.parse(query.highlights);
        } else if (Array.isArray(query.highlights)) {
            highlights = query.highlights;
        }

        query.highlights = highlights;

        return query;
    }

    /**
     * Builds the gist url.
     * @param {string} value the value of the inlineCode block.
     * @param {PluginOptions} options the options of the plugin.
     * @param {string} file the file to be loaded.
     * @returns {string} the gist url.
     */
    buildUrl(embedLink, file) {
        const gistUrl = embedLink.split(/[?#]/)[0];

        // builds the url and completes it with the file if any
        let url = `${gistUrl}.json`;
        if (file != null) {
            url += `?file=${file}`;
        }

        return url;
    }

    async getEmbedData(embedLink) {

        const query = this.getQuery(embedLink);
        const apiUrl = this.buildUrl(embedLink, query.file);

        const response = await fetch(apiUrl)
        const embedData = await response.json();

        let html = embedData.div;
        if (query.highlights.length > 0) {
            const $ = cheerio.load(embedData.div);
            const file = query.file.replace(/[^a-zA-Z0-9_]+/g, "-").toLowerCase();
            query.highlights.forEach(line => {
                $(`#file-${file}-LC${line}`).addClass("highlighted");
            });

            html = $.html();
        }

        const template = this.getTemplate();

        return template({
            id: this.getEmbedId(embedLink),
            link: embedLink,
            embedData: html == undefined ? '' : html.trim(),
            options: this.options
        });
    }
}

module.exports = Gist;
