/**
 * Component Generator Script
 *
 * Generates a new React Native component with Unistyles styling and tests
 * Usage: node scripts/generate/component.js <ComponentName>
 */

const fs = require("fs")
const path = require("path")

const componentName = process.argv[2]

if (!componentName) {
  console.error("Please provide a component name")
  process.exit(1)
}

const componentDir = path.join(__dirname, "../../app/components")
const componentFile = path.join(componentDir, `${componentName}.tsx`)
const testFile = path.join(componentDir, `${componentName}.test.tsx`)

const componentTemplate = `import React from 'react'
import { View, Text } from 'react-native'

export interface ${componentName}Props {
  /**
   * An optional style override useful for padding & margin.
   */
  className?: string
}

/**
 * Describe your component here
 */
export const ${componentName} = ({ className }: ${componentName}Props) => {
  return (
    <View className={\`\${className}\`}>
      <Text className="text-gray-900 dark:text-white">${componentName}</Text>
    </View>
  )
}
`

const testTemplate = `import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { ${componentName} } from './${componentName}'

describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />)
    expect(screen.getByText('${componentName}')).toBeTruthy()
  })
})
`

// Check if component already exists
if (fs.existsSync(componentFile)) {
  console.error(`Component ${componentName} already exists`)
  process.exit(1)
}

// Write files
fs.writeFileSync(componentFile, componentTemplate)
fs.writeFileSync(testFile, testTemplate)

console.log(`✅ Created component ${componentName} at ${componentFile}`)
console.log(`✅ Created test ${componentName} at ${testFile}`)
