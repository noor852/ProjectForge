const sanitizeHtml = require("sanitize-html");

// fields that must never be changed (a password may contain characters like < or &)
const SKIP = ["password"];

function cleanText(text) {
  // remove every tag and attribute, keep only plain text
  const clean = sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });
  // sanitize-html writes "&" as "&amp;", turn it back so "R&D" stays "R&D"
  return clean.replace(/&amp;/g, "&").trim();
}

function cleanValue(value) {
  if (typeof value === "string") {
    return cleanText(value);
  }
  if (Array.isArray(value)) {
    const result = [];
    for (let i = 0; i < value.length; i++) {
      result.push(cleanValue(value[i]));
    }
    return result;
  }
  if (value !== null && typeof value === "object") {
    const result = {};
    const keys = Object.keys(value);
    for (let i = 0; i < keys.length; i++) {
      if (SKIP.indexOf(keys[i]) !== -1) {
        result[keys[i]] = value[keys[i]];
      } else {
        result[keys[i]] = cleanValue(value[keys[i]]);
      }
    }
    return result;
  }
  return value;
}

// sanitize the request body before any controller can save it
module.exports = function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = cleanValue(req.body);
  }
  next();
};

// also used by controllers to clean query strings
module.exports.cleanText = cleanText;