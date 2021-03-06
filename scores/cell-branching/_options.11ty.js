const requireRoot = require("app-root-path").require;

const pitchClasses = requireRoot(
  "./assets/modules/settings/pitch-classes/index.11ty.js"
);

const websocketsSettings = requireRoot(
  "./assets/modules/settings/websockets.11ty.js"
);

const generateButton = requireRoot(
  "./assets/modules/settings/generate-button.11ty.js"
);

module.exports = () => `
<form class="score-options">
  ${pitchClasses()}
  ${generateButton()}
</form>
${websocketsSettings()}`;
