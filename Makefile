all: zip

zip: manifest.json icon*.png content.js
	zip ../DebateTemplateHotkeys.zip manifest.json icon*.png content.js