import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Service } from '../constants/data';
import Theme from '../constants/theme';

interface ServiceCardProps {
  service: Service;
  onPress: () => void;
  variant?: 'horizontal' | 'vertical';
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onPress,
  variant = 'vertical',
}) => {
  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.cardHorizontal}
        onPress={onPress}
      >
        <View style={styles.imageBoxHorizontal}>
          <Image source={service.image} style={styles.image} resizeMode="contain" />
        </View>
        <Text style={styles.nameHorizontal} numberOfLines={1}>{service.name}</Text>
        <Text style={styles.priceHorizontal}>{service.priceFormatted}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.cardVertical}
      onPress={onPress}
    >
      <View style={styles.imageBoxVertical}>
        <Image source={service.image} style={styles.image} resizeMode="contain" />
      </View>

      <View style={styles.infoColVertical}>
        <Text style={styles.nameVertical}>{service.name}</Text>
        {service.description ? (
          <Text style={styles.descVertical} numberOfLines={2}>
            {service.description}
          </Text>
        ) : null}

        <View style={styles.bottomRowVertical}>
          <Text style={styles.priceVertical}>{service.priceFormatted}</Text>

          {service.rating ? (
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={13} color={Theme.colors.rating} />
              <Text style={styles.ratingText}>{service.rating}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={Theme.colors.textSecondary}
        style={styles.chevron}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical Card (Full width list - scroll ke bawah)
  cardVertical: {
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    ...Theme.shadow.card,
  },
  imageBoxVertical: {
    width: 75,
    height: 75,
    borderRadius: 14,
    backgroundColor: '#F8FAF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  infoColVertical: {
    flex: 1,
    justifyContent: 'center',
  },
  nameVertical: {
    fontSize: 14,
    fontWeight: '700',
    color: Theme.colors.text,
    marginBottom: 4,
  },
  descVertical: {
    fontSize: 12,
    color: Theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8,
  },
  bottomRowVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 6,
  },
  priceVertical: {
    fontSize: 14,
    fontWeight: '800',
    color: Theme.colors.primary,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9EE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B47B00',
  },
  chevron: {
    marginLeft: 6,
  },

  // Horizontal Card
  cardHorizontal: {
    width: 110,
    backgroundColor: Theme.colors.white,
    borderRadius: Theme.radius.card,
    padding: 10,
    alignItems: 'center',
    marginRight: 12,
    ...Theme.shadow.card,
  },
  imageBoxHorizontal: {
    width: 75,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  image: {
    width: '90%',
    height: '90%',
  },
  nameHorizontal: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  priceHorizontal: {
    fontSize: 12,
    fontWeight: '700',
    color: Theme.colors.primary,
    textAlign: 'center',
  },
});

export default ServiceCard;
