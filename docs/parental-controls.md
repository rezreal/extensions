# Parental Control Extension

## General

Slug: parental-controls
Extension Name: Parental Controls
Subtitle: Parental Controls for Devices
Summary: Restrict devices via Parental Control Software. Works with most devices: Phones, Tablets and PCs (iOS, Android, Windows, Chromebooks).
Main page URL: ${baseOrigin}/init
Configuration page URL: ${baseOrigin}/init
Webhook URL: ${baseOrigin}/webhook/parental-controls
Username: <configure as WEBHOOK_USERNAME>
Password: <configure as WEBHOOK_PASSWORD>

## Configuration 

The following configuration should be set up in the chaster developer portal:

Available modes: Unlimited
Default regularity: 00 : 00 : 00
Start Timeout: off
Default Configuration (JSON):
```json
{
  "capabilities": [
    "FILTER_CONTENT"
  ],
  "allowAccountFreezing": false,
  "hideChanges": false
}
```

Default Data (JSON):
```json
{
  "accounts": []
}
```

Configuration description (Handlebars)
```handlebars
This lock wants to:

{{#each capabilities}}
{{#eq this "FILTER_CONTENT"}}- Filter Content{{/eq}}
{{#eq this "BLOCK_APPS"}}- Block Apps{{/eq}}
{{#eq this "TRACK_ACTIVITY"}}- Track Activity{{/eq}}
{{#eq this "TRACK_LOCATION"}}- Track Geolocations{{/eq}}
{{#eq this "LOCK_DEVICES"}}- Lock Devices{{/eq}}
{{/each}}

{{#if hideChanges}}Changes to the rules are invisible for the wearer.
{{else}}Changes to the rules are visible in the lock history.{{/if}}

{{#if allowAccountFreezing}}**The owner may choose to freeze the wearers accounts until the lock is opened!**{{/if}}
```