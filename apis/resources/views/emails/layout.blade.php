<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>{{ $title ?? 'HopeFairy Advisory Notification' }}</title>
  <style>
    /* Reset & Base Styles */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      min-width: 100% !important;
      background-color: #090d16 !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #334155;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      word-break: break-word;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
    table {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    img {
      border: 0;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
      max-width: 100%;
      height: auto;
      display: block;
    }
    a {
      text-decoration: none;
    }
    .wrapper {
      width: 100%;
      background-color: #090d16;
      padding: 36px 12px;
      box-sizing: border-box;
    }
    .container {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
      border: 1px solid #1e2638;
      box-sizing: border-box;
      word-break: break-word;
    }
    .header {
      background: linear-gradient(135deg, #090d16 0%, #111726 50%, #171d2b 100%);
      padding: 28px 24px 24px 24px;
      text-align: center;
      border-bottom: 2px solid #d8b056;
      box-sizing: border-box;
    }
    .logo-emblem {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1.5px solid #d8b056;
      display: inline-block;
      vertical-align: middle;
      box-shadow: 0 0 14px rgba(216, 176, 86, 0.4);
    }
    .logo-text {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      margin: 0;
      display: inline-block;
      vertical-align: middle;
      line-height: 1;
    }
    .logo-accent {
      color: #d8b056;
    }
    .tagline {
      color: #94a3b8;
      font-size: 12px;
      margin-top: 6px;
      letter-spacing: 0.4px;
      font-weight: 500;
      line-height: 1.4;
    }
    .content {
      padding: 32px 28px;
      box-sizing: border-box;
      word-break: break-word;
    }
    .card {
      background-color: #fbf7ee;
      border: 1px solid #e0c179;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      box-sizing: border-box;
      word-break: break-word;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #eedb9f 0%, #d8b056 50%, #c89b3c 100%);
      color: #0b0b0c !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 14.5px;
      padding: 13px 30px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(216, 176, 86, 0.4);
      letter-spacing: 0.3px;
      box-sizing: border-box;
      max-width: 100%;
      margin: 16px 0;
    }
    .footer {
      background-color: #f8fafc;
      padding: 22px 24px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
      box-sizing: border-box;
      word-break: break-word;
    }
    .footer p {
      margin: 4px 0;
      line-height: 1.5;
    }
    .footer a {
      color: #b38827;
      text-decoration: none;
      font-weight: 700;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 12px 6px !important;
      }
      .container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 12px !important;
      }
      .header {
        padding: 20px 14px !important;
      }
      .logo-emblem {
        width: 38px !important;
        height: 38px !important;
      }
      .logo-text {
        font-size: 21px !important;
      }
      .content {
        padding: 20px 14px !important;
      }
      .card {
        padding: 16px 12px !important;
      }
      .btn {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 13px 16px !important;
        font-size: 14px !important;
        text-align: center !important;
      }
      .footer {
        padding: 18px 12px !important;
        font-size: 11px !important;
      }
    }
  </style>
  @php
    $emblemPath = public_path('brand/hopefairy-emblem-sm.png');
    $logoSrc = null;
    if (isset($message) && is_object($message) && method_exists($message, 'embed') && file_exists($emblemPath)) {
        $logoSrc = $message->embed($emblemPath);
    } elseif (file_exists($emblemPath)) {
        $logoSrc = 'data:image/png;base64,' . base64_encode(file_get_contents($emblemPath));
    } else {
        $logoSrc = env('FRONTEND_URL', 'http://localhost:3000') . '/brand/hopefairy-emblem-sm.png';
    }
  @endphp
</head>
<body>
  <div class="wrapper">
    <div class="container">
      
      <!-- Luxury HopeFairy Header with Embedded Logo -->
      <div class="header">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 auto; text-align: center;">
          <tr>
            <td align="center" style="padding: 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 6px auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="{{ $logoSrc }}" alt="HopeFairy Emblem" width="44" height="44" class="logo-emblem" style="width: 44px; height: 44px; border-radius: 50%; border: 1.5px solid #d8b056; display: block; -ms-interpolation-mode: bicubic;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <h1 class="logo-text" style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0; line-height: 1; letter-spacing: -0.5px;">Hope<span class="logo-accent" style="color: #d8b056;">Fairy</span></h1>
                  </td>
                </tr>
              </table>
              <div class="tagline">Where Dreams Meet Destinations · Study Abroad &amp; Admissions</div>
            </td>
          </tr>
        </table>
      </div>

      <div class="content">
        @yield('content')
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px 0; font-weight: 700; color: #334155;">HopeFairy Education Consultancy · Global Admissions Advisory</p>
        <p style="margin: 0 0 6px 0;">Official Website: <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}" target="_blank">hopefairy.com</a> &bull; Support: <a href="mailto:info@hopefairy.com">info@hopefairy.com</a></p>
        <p style="margin: 0; font-size: 11px; color: #94a3b8;">&copy; {{ date('Y') }} HopeFairy. All rights reserved.</p>
      </div>

    </div>
  </div>
</body>
</html>
