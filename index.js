const path = require('path')

module.exports = (bundler) => {
    let aliases = bundler.options.aliases || false

    if (!aliases) {
        try {
            aliases = require(path.join(bundler.options.rootDir, '/.aliasrc.js'))
        } catch(e) {
            // no handler
            console.log(`Can't find .aliasrc.js: ${ e }`)
        }
    }

    if (aliases) {
        let originResolver = bundler.resolver
        let originResolve = originResolver.resolve

        originResolver.resolve = (filename, parent) => {
            if (filename) {
                for (let name in aliases) {
                    let alias = path.join(bundler.options.rootDir, aliases[name])

                    if (filename === name || startsWith(filename, name + '/')) {
                        if (filename !== alias && !startsWith(filename, alias + '/')) {
                            /**
                             * compatible with new version(1.7.0)
                             * @type {boolean}
                             */
                            let newVersion = !!originResolver.packageCache

                            if (newVersion) {
                                filename = alias.replace(bundler.options.rootDir, '') + filename.substr(name.length)
                            } else {
                                filename = alias + filename.substr(name.length)
                            }
                        }
                    }
                }
            }

            return originResolve.call(originResolver, filename, parent)
        }
    }
}

function startsWith (string, searchString) {
    const stringLength = string.length
    const searchLength = searchString.length

    // early out if the search length is greater than the search string
    if(searchLength > stringLength) {
        return false
    }
    let index = -1
    while(++index < searchLength) {
        if(string.charCodeAt(index) !== searchString.charCodeAt(index)) {
            return false
        }
    }
    return true
}
