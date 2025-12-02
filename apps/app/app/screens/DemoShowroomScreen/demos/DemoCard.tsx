/* eslint-disable react/jsx-key, react-native/no-inline-styles */
import { Platform } from "react-native"

import { AutoImage } from "@/components/AutoImage"
import { Button } from "@/components/Button"
import { Card } from "@/components/Card"
import { Icon } from "@/components/Icon"

import { DemoDivider } from "../DemoDivider"
import { Demo } from "./types"
import { DemoUseCase } from "../DemoUseCase"

export const DemoCard: Demo = {
  name: "Card",
  description: "demoCard:description",
  data: ({ theme }) => [
    <DemoUseCase
      name="demoCard:useCase.presets.name"
      description="demoCard:useCase.presets.description"
    >
      <Card
        headingTx="demoCard:useCase.presets.default.heading"
        contentTx="demoCard:useCase.presets.default.content"
        footerTx="demoCard:useCase.presets.default.footer"
      />
      <DemoDivider />
      <Card
        headingTx="demoCard:useCase.presets.reversed.heading"
        contentTx="demoCard:useCase.presets.reversed.content"
        footerTx="demoCard:useCase.presets.reversed.footer"
        preset="elevated"
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoCard:useCase.verticalAlignment.name"
      description="demoCard:useCase.verticalAlignment.description"
    >
      <Card
        headingTx="demoCard:useCase.verticalAlignment.top.heading"
        contentTx="demoCard:useCase.verticalAlignment.top.content"
        footerTx="demoCard:useCase.verticalAlignment.top.footer"
        style={{ minHeight: 160 }}
      />
      <DemoDivider />
      <Card
        headingTx="demoCard:useCase.verticalAlignment.center.heading"
        verticalAlignment="center"
        preset="elevated"
        contentTx="demoCard:useCase.verticalAlignment.center.content"
        footerTx="demoCard:useCase.verticalAlignment.center.footer"
        style={{ minHeight: 160 }}
      />
      <DemoDivider />
      <Card
        headingTx="demoCard:useCase.verticalAlignment.spaceBetween.heading"
        verticalAlignment="space-between"
        contentTx="demoCard:useCase.verticalAlignment.spaceBetween.content"
        footerTx="demoCard:useCase.verticalAlignment.spaceBetween.footer"
        style={{ minHeight: 160 }}
      />
      <DemoDivider />
      <Card
        preset="elevated"
        headingTx="demoCard:useCase.verticalAlignment.reversed.heading"
        verticalAlignment="force-footer-bottom"
        contentTx="demoCard:useCase.verticalAlignment.reversed.content"
        footerTx="demoCard:useCase.verticalAlignment.reversed.footer"
        style={{ minHeight: 160 }}
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoCard:useCase.passingContent.name"
      description="demoCard:useCase.passingContent.description"
    >
      <Card
        headingTx="demoCard:useCase.passingContent.heading"
        contentTx="demoCard:useCase.passingContent.content"
        footerTx="demoCard:useCase.passingContent.footer"
      />
      <DemoDivider />
      <Card
        preset="elevated"
        headingTx="demoShowroomScreen:demoViaSpecifiedTxProp"
        headingTxOptions={{ prop: "heading" }}
        contentTx="demoShowroomScreen:demoViaSpecifiedTxProp"
        contentTxOptions={{ prop: "content" }}
        footerTx="demoShowroomScreen:demoViaSpecifiedTxProp"
        footerTxOptions={{ prop: "footer" }}
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoCard:useCase.customComponent.name"
      description="demoCard:useCase.customComponent.description"
    >
      <Card
        HeadingComponent={
          <Button
            variant="filled"
            text="HeadingComponent"
            LeftAccessory={(props) => <Icon containerStyle={props.style} icon="ladybug" />}
          />
        }
        ContentComponent={
          <Button
            style={{ marginVertical: theme.spacing.sm }}
            text="ContentComponent"
            LeftAccessory={(props) => <Icon containerStyle={props.style} icon="ladybug" />}
          />
        }
        FooterComponent={
          <Button
            variant="filled"
            text="FooterComponent"
            LeftAccessory={(props) => <Icon containerStyle={props.style} icon="ladybug" />}
          />
        }
      />
      <DemoDivider />
      <Card
        headingTx="demoCard:useCase.customComponent.rightComponent"
        verticalAlignment="center"
        RightComponent={
          <AutoImage
            maxWidth={80}
            maxHeight={60}
            style={{ alignSelf: "center" }}
            source={{
              uri: "https://user-images.githubusercontent.com/1775841/184508739-f90d0ce5-7219-42fd-a91f-3382d016eae0.png",
            }}
          />
        }
      />
      <DemoDivider />
      <Card
        preset="elevated"
        headingTx="demoCard:useCase.customComponent.leftComponent"
        verticalAlignment="center"
        LeftComponent={
          <AutoImage
            maxWidth={80}
            maxHeight={60}
            style={{ alignSelf: "center" }}
            source={{
              uri: "https://user-images.githubusercontent.com/1775841/184508739-f90d0ce5-7219-42fd-a91f-3382d016eae0.png",
            }}
          />
        }
      />
    </DemoUseCase>,

    <DemoUseCase
      name="demoCard:useCase.style.name"
      description="demoCard:useCase.style.description"
    >
      <Card
        headingTx="demoCard:useCase.style.heading"
        HeadingTextProps={{ style: { color: theme.colors.error } }}
        contentTx="demoCard:useCase.style.content"
        ContentTextProps={{
          style: {
            backgroundColor: theme.colors.error,
            color: theme.colors.palette.neutral100,
          },
        }}
        footerTx="demoCard:useCase.style.footer"
        FooterTextProps={{
          style: {
            textDecorationLine: "underline line-through",
            textDecorationStyle: "dashed",
            color: theme.colors.error,
            textDecorationColor: theme.colors.error,
          },
        }}
        style={{
          // Custom shadow styling for demo
          shadowColor: theme.colors.error,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.select({
            web: 0.3,
            default: 0.5,
          }),
          shadowRadius: 4,
          elevation: 2,
        }}
      />
    </DemoUseCase>,
  ],
}

// @demo remove-file
