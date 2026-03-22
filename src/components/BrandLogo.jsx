import iconUrl from '../../kevdev-icono.png'

export default function BrandLogo({ className = '', alt = 'kevdev', ...props }) {
  return (
    <img
      src={iconUrl}
      alt={alt}
      className={className}
      draggable={false}
      {...props}
    />
  )
}
