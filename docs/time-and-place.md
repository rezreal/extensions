# Parental Control Extension

## General

Slug: time-and-place
Extension Name: Time and Place
Subtitle: Prevents unlocking unless you are at times and/or locations.
Summary: This extensions prevents you to unlock unless you are at the right location at the right time (Smartphone with required).
Main page URL: ${baseOrigin}/init
Configuration page URL: ${baseOrigin}/init

## Configuration 

The following configuration should be set up in the chaster developer portal:

Available modes: Unlimited
Default regularity: 00 : 00 : 00
Start Timeout: off
Default Configuration (JSON):
```json
{
  "unlockations": [],
}
```

Default Data (JSON):
```json
{
  "unlocked": [

  ]
}
```

Configuration description (Handlebars)
```handlebars
This lock can only be unlocked, if:


{{#each unlockations}}
{{#eq this "FILTER_CONTENT"}}- Filter Content{{/eq}}
{{#eq this "BLOCK_APPS"}}- Block Apps{{/eq}}
{{#eq this "TRACK_ACTIVITY"}}- Track Activity{{/eq}}
{{#eq this "TRACK_LOCATION"}}- Track Geolocations{{/eq}}
{{#eq this "LOCK_DEVICES"}}- Lock Devices{{/eq}}
{{/each}}

```