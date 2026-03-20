function SafeImage({ src, alt, style }) {

  if (!src) return null

  return <img src={src} alt={alt} style={style} />

}

export default SafeImage