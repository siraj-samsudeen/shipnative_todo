import { ConfigPlugin, withEntitlementsPlist, withInfoPlist } from "@expo/config-plugins"

type PluginProps = {
  appGroupIdentifier?: string
}

/**
 * Ensures the iOS app has the App Group entitlement required for widgets.
 */
const withWidgetAppGroup: ConfigPlugin<PluginProps> = (config, props = {}) => {
  const bundleIdentifier =
    config.ios?.bundleIdentifier ??
    (config as any).bundleIdentifier ??
    config.android?.package ??
    "com.shipnative.app"
  const appGroupIdentifier = props.appGroupIdentifier ?? `group.${bundleIdentifier}`

  let next = withEntitlementsPlist(config, (config) => {
    const entitlements = config.modResults["com.apple.security.application-groups"] as
      | string[]
      | undefined
    const groups = new Set(entitlements ?? [])
    groups.add(appGroupIdentifier)
    config.modResults["com.apple.security.application-groups"] = Array.from(groups)
    return config
  })

  next = withInfoPlist(next, (config) => {
    config.modResults.APP_GROUP_IDENTIFIER = appGroupIdentifier
    return config
  })

  return next
}

export default withWidgetAppGroup
