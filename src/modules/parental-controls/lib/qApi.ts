export const NumericBoolean = {
  TRUE: 1 as NumericBoolean,
  FALSE: 0 as NumericBoolean,
}

export type NumericBoolean = 1 | 0

/**
 * A Profile.
 */
export interface QProfile {
  readonly id: number
  readonly uid: string
  readonly account_id: number
  readonly name: string
  readonly birth_date: string
  readonly picture: string
  readonly order: number
  /** maybe incomplete */
  readonly gender: 'MALE' | 'FEMALE' | 'UNSPECIFIED'
  readonly device_count: number
  readonly device_ids: readonly number[]
  readonly status: {
    readonly lastseen: IsoDateTime
    readonly location: unknown
    readonly is_online: boolean
    readonly questionable_events: {
      readonly count: number
      readonly start_date: IsoDateTime
      readonly end_date: IsoDateTime
    }
  }
}

export interface QDevice extends LocationProps {
  readonly id: number
  readonly uid: string
  readonly enabled: NumericBoolean
  readonly name: string
  /** e.g. Europe/Berlin */
  readonly timezone: string
  readonly version: string
  readonly account_id: number
  /** todo: other types */
  readonly type: PlatformType
  readonly platform: Platform
  readonly ppk_version: string
  readonly hide_trayicon: NumericBoolean
  readonly users: readonly DeviceUser[]
  readonly mdm_profile_used: boolean
  readonly default_profile_id: number
  readonly automatic_updates: boolean
  readonly alerts: { readonly unauthorized_remove: boolean }
  readonly lastseen: IsoDateTime
}

/** maybe incomplete */
export type PlatformType = 'PC' | 'MOBILE'

/** others to be defined */
export enum Platform {
  Windows = 0,
  Mac = 1,
  Android = 2,
  IOS = 4,
}

/** e.g. 2023-07-14 20:29:35 */
export type IsoDateTime = string

export interface DeviceUser extends LocationProps {
  readonly id: number
  readonly name: string
  readonly uid: string
  readonly profile_id: number
  readonly created: IsoDateTime
  readonly status: DeviceUserStatus
}

export interface DeviceUserStatus {
  readonly safe_network: UserFeatureStatus
  readonly panic_button: UserFeatureStatus
  readonly disable_protection: UserFeatureStatus
  readonly browser_lock: UserFeatureStatus
  readonly vpn_disable: UserFeatureStatus
}

export interface LocationProps {
  readonly location_latitude: number | null
  readonly location_longitude: number | null
  /** String containing a json encoded address */
  readonly location_address?: string
  readonly location_time: IsoDateTime | null
  /** Accuracy in meters */
  readonly location_accuracy: number | null
}

export interface UserFeatureStatus {
  readonly status: boolean | null
  readonly modified: IsoDateTime | null
}

export interface License {
  readonly id: number
  readonly name: string
  readonly enabled: NumericBoolean
  readonly trial: boolean
  /** seen: LICENSE_FREE */
  readonly type: string
  readonly duration_days: number | null
  /** 1 for free accounts */
  readonly max_profiles: number
  /** 1 for free accounts */
  readonly max_devices: number
  readonly start_date: IsoDateTime
  readonly end_date: IsoDateTime | null
  readonly max_log_days: number
  /** seen: '_strFreeAccount'  */
  readonly description: string
  /** seen: 'free_1' */
  readonly license_name: string
  readonly autorenewal: boolean
  readonly purchase: unknown
  readonly affiliate: {
    readonly name: string
    readonly show_conversion_elements: boolean
    readonly icon: string
  }
  readonly label: 'string'
  readonly source_campaign: 'trial3only-qustodio-web-onboard'
  readonly license_sub_type: 'free'
}

export interface Account {
  readonly id: number
  readonly uid: string
  readonly name: string
  readonly email: string
  readonly fullname: string
  readonly surname?: string
  readonly enabled: boolean
  readonly validated: boolean
  readonly devices_count: number
  readonly profiles_count: number
  /** Receive a daily activity report by email. */
  readonly is_daily_report: boolean
  /** Receive a weekly activity report by email. */
  readonly is_weekly_report: boolean
  readonly tenant_name: string
  readonly suspended: boolean
  readonly suspended_modified?: IsoDateTime
  readonly locale: string
  /** Two-Letter Country Code uppercase */
  readonly country: string
  /** Iso Timezone, e.g. "Europe/London". Might be important for clock based time limits. */
  readonly timezone: string
  readonly master_account_id?: number
  readonly master_account_uid?: string
  readonly created: IsoDateTime
  /** maybe incomplete */
  readonly account_status: 'enabled'
}

export interface QProfileRulesPut {
  readonly profile: number
  readonly time_restrictions: TimeRestrictions
  readonly app_rules: AppRules
  readonly call_sms_monitoring: {
    readonly enabled: boolean
    readonly monitor_sms_content: boolean
    readonly incoming_calls_block: boolean
    readonly outgoing_calls_block: boolean
    readonly incoming_sms_block: boolean
    readonly contact_block: []
  }
  readonly web: WebRules
  readonly videos: {
    readonly youtube: {
      readonly ids: object // todo: inspect
    }
  }
  readonly location: {
    readonly enabled: boolean
    /** in seconds, default is 3600, however it is device managed on IOS and has no effect there. */
    readonly location_update_frequency: number
  }
  readonly panic: PanicConfiguration
  readonly is_alert_new_apps: boolean
  readonly is_social_inspection: boolean
  readonly unsupported_browsers: UnsupportedBrowsersConfiguration
}

/**
 * A Profile Rule Configuration.
 **/
export interface QProfileRules extends QProfileRulesPut {
  readonly account: number
  /** TODO: document structure */
  readonly contacts: Array<unknown>
  readonly enabled: NumericBoolean
  /** Iso timestamp */
  readonly update_time: string

  readonly is_monitor_words: boolean
  readonly is_monitor_people: boolean
  readonly is_alert_app_usage_increased: boolean

  readonly is_alert_new_contacts: boolean

  // todo: inspect
  readonly safe_network_rules: {
    readonly modified_at: IsoDateTime
    readonly disable_protection_in_safe_network: true
  }
  readonly facebook_app_user: {
    readonly connected: boolean
    readonly data_collected: boolean
  }
}

export interface UnsupportedBrowsersConfiguration {
  is_blocked_unsupported_browsers: boolean
  browser_list: Array<UnsupportedBrowser>
}

export interface UnsupportedBrowser {
  readonly name: string
  readonly android_name: string
  readonly windows_name: string
  readonly osx_name: string
  readonly linux_name: string
  readonly ios_name: string
  readonly chromebook_name: string
}

export interface PanicConfiguration {
  /** TODO to be analyzed */
  mode: number
  account_holder: {
    name: string
    contact: string
    /** maybe unverified missing? */
    status: 'VERIFIED'
    /** maybe PHONE or SMS missing? */
    type: 'EMAIL'
  }
  /** TODO to be analyzed */
  contacts: Array<unknown>
}

export interface WebRules {
  /** Allowed, Forbidden and Warned Web-Domains */
  readonly domains: Record<string, BlockActionCode>
  readonly categories: readonly WebRuleCategory[]
  /** Set filtering rules for specific websites. These rules override the category rules. See domains property. */
  readonly is_domain_list: boolean
  /** Apply Web filters by category. See categories property. */
  readonly is_category_list: boolean
  /**  Remove potentially harmful content from web search results. */
  readonly is_safe_search: boolean
  /** Remove the risk of my child accessing uncategorized websites. */
  readonly is_allow_unknown_sites: boolean
  /** The domain the user is redirected to if they enter a forbidden url. */
  readonly redirect_domain: string
  /** Receive an email when my child tries to access a blocked website. */
  readonly is_report_blocked_sites: boolean
}

export interface WebRuleCategory {
  readonly action: 'BLOCK' | 'ALERT'
  /** todo be clarified */
  readonly category: WebCategory | number
}

export enum WebCategory {
  ALCOHOL = 1,
  CHAT = 2,
  DRUGS = 3,
  EDUCATION = 4,
  EMPLOYMENT = 5,
  ENTERTAINMENT = 6,
  GAMBLING = 7,
  GAMES = 8,
  A9 = 9,
  MATURE_CONTENT = 12,
  NEWS = 13,
  PORNOGRAPHY = 14,
  PROFANITY = 15,
  SEARCH_ENGINES = 17,
  SHOPPING = 18,
  SOCIAL_NETWORKS = 19,
  TOBACCO = 21,
  VIOLENCE = 23,
  WEAPONS = 24,
  WEBMAIL = 25,
  FILE_SHARING = 28,
  PROXIES_LOOPHOLES = 29,
  FORUMS = 30,
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thr' | 'fri' | 'sat' | 'sun'

export type Minute = number

/**
 * @typedef {Object} TimeRestrictions
 * @property { Object.<{ nav_elapsed: number, nav_date_id: number }> } usage
 */
export interface TimeRestrictions {
  readonly time_ranges: Record<Weekday, number>
  /** Set a screen time allowance for each day of the week. */
  readonly quotas: Record<Weekday, Minute>
  readonly is_multi_devices: boolean
  readonly is_daily_limit: boolean
  /** Apply restricted times at weekend */
  readonly is_weekend_quota: boolean
  /** Block apps on Android and hide apps on iOS devices. Log out of session on desktop. */
  readonly is_lock_computer: boolean
  /** Prevent web browsing and internet access. */
  readonly is_lock_navigation: boolean
  /** Receive an alert when your child reaches their limit. */
  readonly is_report_alerts: boolean
  readonly usage: { nav_elapsed: number; nav_date_id: number }
}

export interface AppRules {
  readonly is_application_list: boolean
  readonly application_list: readonly AppRule[]
}

/**
 * TODO: structure to be documented
 */
export interface AppRule {
  id: string | null
  profile: number
  /** exeutable or package name */
  exe: string
  /** A string containing a number of Platform? */
  platform: string
  action: null | BlockActionCode
  /** quotas in minutes per day */
  mon_quota: number
  tue_quota: number
  wed_quota: number
  thr_quota: number
  fri_quota: number
  sat_quota: number
  sun_quota: number
  is_unsupported_browser: boolean
  name: string
  /** amazon s3 url to jpg app icon **/
  thumbnail: string
  /**  **/
  blockable: boolean
}

/**
 * Enum for BlockActions
 * @readonly
 * @enum {BlockActionCode}
 */
export enum BlockActionCode {
  'ALLOW' = 0,
  'BLOCK' = 1,
  'REPORT' = 2,
  'IGNORE' = 3,
}

export interface EventsResponse {
  readonly account_uid: string
  readonly page_id: string
  readonly user_uid: string
  readonly timeline: readonly TimelineEntry[]
}

/** Epoch in seconds */
export type QustodioTimestamp = number

export enum TimelineEntryType {
  PageVisit = 101,
  WebSearch = 103,
  AppUsage = 301,
  Location = 400,
}

interface AbstractTimelineEntry {
  readonly type: TimelineEntryType
  readonly dt: IsoDateTime
  /** Seconds dt is away from utc */
  readonly utc_diff_seconds?: number
  readonly device: Pick<QDevice, 'id' | 'name' | 'type' | 'platform'>
  readonly key: string
  readonly user_id: number
  readonly device_user_id: number
  readonly device_id: number
  /** When this entry will expire (usually a month after recording) */
  readonly ttl: QustodioTimestamp

  readonly action: BlockActionCode
  readonly reason: number

  readonly qualification: number
}

export interface PageVisitEntry extends AbstractTimelineEntry {
  readonly type: TimelineEntryType.PageVisit
  readonly url: string
  readonly host: string
  /** Title of the visited Page */
  readonly title: string
  readonly categories: readonly WebCategory[]
  /** Likely the duration of this visit? */
  readonly minutes: number
  /** How many sub-pages were visited */
  readonly pages: number
  /** How many of the sub-pages were blocked */
  readonly blocked_pages: number
}

export interface WebSearchEntry extends AbstractTimelineEntry {
  readonly type: TimelineEntryType.WebSearch
  /** the searched text */
  readonly text: string
  /** seen: google */
  readonly search_engine: string
}

export interface AppUsageEntry extends AbstractTimelineEntry {
  readonly type: TimelineEntryType.AppUsage
  /** A technical app name */
  readonly app_name: string
  /** A readable app name */
  readonly name: string
  /** Likely the duration of this visit? */
  readonly minutes: number
  /** How long the app has been used */
  readonly app_seconds: number
  readonly platform: Platform
  /** S3 url to png */
  readonly thumbnail?: string
}

export interface LocationTimelineEntry
  extends AbstractTimelineEntry,
    LocationProps {
  readonly type: TimelineEntryType.Location
  /** seen: 6 fixme: unknown */
  readonly location_type: number
  /** seconds */
  readonly location_update_frequency: number
  /** @default 86400 */
  readonly location_ttl: number
}

export type TimelineEntry =
  | PageVisitEntry
  | WebSearchEntry
  | AppUsageEntry
  | LocationTimelineEntry
