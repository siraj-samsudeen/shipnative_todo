/**
 * Screen Generator Script
 *
 * Generates a new Screen component with navigation and layout
 * Usage: node scripts/generate/screen.js <ScreenName>
 */

const fs = require("fs")
const path = require("path")

const screenName = process.argv[2]

if (!screenName) {
  console.error("Please provide a screen name (e.g. ProfileScreen)")
  process.exit(1)
}

const screenDir = path.join(__dirname, "../../app/screens")
const screenFile = path.join(screenDir, `${screenName}.tsx`)

const screenTemplate = `import React, { FC } from 'react'
import { View } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AppStackParamList } from '@/navigators'
import { Screen, Text } from '@/components'
import { useAppTheme } from '@/theme/context'

interface ${screenName}Props extends NativeStackScreenProps<AppStackParamList, '${screenName.replace("Screen", "")}'> {}

export const ${screenName}: FC<${screenName}Props> = (_props) => {
  const { theme } = useAppTheme()

  return (
    <Screen
      preset="scroll"
      contentContainerClassName="p-4"
      safeAreaEdges={['top', 'bottom']}
    >
      <View className="flex-1">
        <Text preset="heading" className="mb-4">
          ${screenName.replace("Screen", "")}
        </Text>
        <Text>
          This is the ${screenName}.
        </Text>
      </View>
    </Screen>
  )
}
`

// Check if screen already exists
if (fs.existsSync(screenFile)) {
  console.error(`Screen ${screenName} already exists`)
  process.exit(1)
}

// Write file
fs.writeFileSync(screenFile, screenTemplate)

console.log(`✅ Created screen ${screenName} at ${screenFile}`)
console.log(
  `⚠️  Don't forget to add '${screenName.replace("Screen", "")}' to AppStackParamList in navigators/navigationTypes.ts`,
)
