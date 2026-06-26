import React from 'react'
import { View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@constants/index'

export function BrandLogo({ size = 28 }: { size?: number }) {
  const outerSize = size;
  const cartSize = Math.round(size * 0.55);
  const badgeSize = Math.round(size * 0.45);
  const checkSize = Math.round(badgeSize * 0.7);

  return (
    <View style={{ width: outerSize, height: outerSize, position: 'relative' }}>
      {/* Outer rounded square with amber brand background */}
      <View style={{
        width: outerSize,
        height: outerSize,
        borderRadius: Math.round(outerSize * 0.25),
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* White shopping cart */}
        <Ionicons name="cart" size={cartSize} color={Colors.white} />
      </View>
      
      {/* Green badge with checkmark at top right */}
      <View style={{
        position: 'absolute',
        top: -Math.round(badgeSize * 0.2),
        right: -Math.round(badgeSize * 0.2),
        width: badgeSize,
        height: badgeSize,
        borderRadius: badgeSize / 2,
        backgroundColor: Colors.success,
        borderWidth: 1.5,
        borderColor: Colors.bg, // Blends with the dark header background
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name="checkmark" size={checkSize} color={Colors.white} />
      </View>
    </View>
  )
}
