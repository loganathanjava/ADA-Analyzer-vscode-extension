# Olympus ADA Analyzer

> Olympus ADA Analyzer a visual studio extension, just analyzing the aura components and finds ADA Compliances.

## Steps to Analyze the ADA

- Just right click on the folder/file which you want to analyze the ADA compliance.
- Click Analyze option on appeared menu. 
- Wait for few moments and check the output console. (ADA Console)

## Features

- Analyzing the ADA Compliances and display the results in Console output. 
- ADA rules can be override by user.
- Add/remove your own ADA rules (Format restricted)
- Default rules can be excluded. 

## Upcoming Features
- Export the results in CSV files.

## Overriding the Rules

> Note: Rules can be overrided by settings.json in vs code.
Rules are defined in below format. You can override or completely remove/exclude them.

```
"LightningADAAnalyzer.rule-{{Tag Name}}: []

Tag Name example: button, inputField, checkboxGroup and etc...
```

Example:
```
 "LightningADAAnalyzer.rule-button": [
        { "attribute": "label", "required": true, "minLength": 2, "message": "Attribute label should be presented in button."}
    ]
You can add/remove attributes as per your requirement. 
```
> Note: The format is restricted for the rules. 

## Exclude rule by tag

Default rules can be excluded when the rule is not in your requirement. To exclude the compelete tag from analyzer add Tag Name in below property. 

```
"LightningADAAnalyzer.tag-exclude" : "h1, p"

In this example the tag H1, P would be skipped by ADA Analyzer. 

```

## Default Supported Tags:
- attribute, button, input, inputField, checkboxGroup, buttonGroup, buttonIcon, menuItem, combobox, datatable, dualListbox, flow, formattedDateTime, formattedEmail, formattedNumber, formattedText, formattedRichText, helptext, select

## Development

Olympus - Avengers 
