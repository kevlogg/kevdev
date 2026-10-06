import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url') || searchParams.get('text') || 'https://kevdev.app'
  const fg = searchParams.get('fg') || searchParams.get('color') || '0f172a'
  const bg = searchParams.get('bg') || 'ffffff'
  const showLogo = searchParams.get('logo') !== 'false'
  const sizeParam = searchParams.get('size') || '512'
  const size = Math.min(Math.max(parseInt(sizeParam, 10) || 512, 128), 2048)

  const fgColor = fg.startsWith('#') ? fg : `#${fg}`
  const bgColor = bg.startsWith('#') || bg === 'transparent' ? bg : `#${bg}`

  try {
    // Generate raw SVG from QRCode library
    const rawSvg = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor === 'transparent' ? '#00000000' : bgColor,
      },
      width: size,
    })

    if (!showLogo) {
      return new NextResponse(rawSvg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      })
    }

    // Read logo file from public/
    let base64Logo = ''
    try {
      let logoPath = path.join(process.cwd(), 'public', 'logo2-png.png')
      if (!fs.existsSync(logoPath)) {
        logoPath = path.join(process.cwd(), 'public', 'favicon-512x512.png')
      }
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        base64Logo = `data:image/png;base64,${logoBuffer.toString('base64')}`
      }
    } catch {
      // Fallback if logo file read fails
    }

    // Embed badge and center logo SVG elements
    // viewBox in rawSvg or width/height = size
    const logoSize = Math.round(size * 0.22)
    const centerPos = (size - logoSize) / 2
    const badgeSize = logoSize + 16
    const badgePos = (size - badgeSize) / 2
    const rx = Math.round(badgeSize * 0.22)
    const badgeFill = bgColor === 'transparent' ? '#ffffff' : bgColor

    const logoSvgGroup = `
      <g id="kevdev-qr-logo">
        <rect x="${badgePos}" y="${badgePos}" width="${badgeSize}" height="${badgeSize}" rx="${rx}" fill="${badgeFill}" stroke="${fgColor}" stroke-opacity="0.2" stroke-width="2"/>
        ${base64Logo ? `<image x="${centerPos}" y="${centerPos}" width="${logoSize}" height="${logoSize}" href="${base64Logo}"/>` : ''}
      </g>
    </svg>`

    const finalSvg = rawSvg.replace('</svg>', logoSvgGroup)

    return new NextResponse(finalSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Error generating QR Code', details: String(err) }, { status: 500 })
  }
}
