import { Link, useParams } from 'react-router-dom'

const legalContent: Record<string, { title: string; intro: string; sections: Array<{ heading: string; text: string[] }> }> = {
  'privacy-policy': {
    title: 'Privacy Policy',
    intro: 'Meskni is built to help people find housing without collecting more personal information than we need.',
    sections: [
      {
        heading: 'What we collect',
        text: [
          'We collect the information you give us when you create an account, list a property, or contact another user. This includes your name, email address, phone number, city, and listing information needed to complete a booking or inquiry.',
          'We do not ask for unnecessary personal data and we only retain what is needed to operate the marketplace safely and provide the service you requested.',
        ],
      },
      {
        heading: 'How we use it',
        text: [
          'We use your information to run your account, match listings with search filters, deliver messages, and support moderation and safety reviews.',
          'We do not sell personal data or use it for unrelated marketing without a clear opt-in choice.',
        ],
      },
      {
        heading: 'Your rights',
        text: [
          'You may request to access, correct, or delete the personal information we hold about you. You can also ask to unsubscribe from marketing or account updates at any time.',
          'If you are under 18, please do not create an account or submit personal information without the involvement of a parent or legal guardian.',
        ],
      },
    ],
  },
  'terms-of-service': {
    title: 'Terms of Service',
    intro: 'These terms describe how Meskni users can browse, list, and communicate through the platform.',
    sections: [
      {
        heading: 'User responsibility',
        text: [
          'Users are responsible for the accuracy of their account information and for the content they publish. Listings should describe the property honestly and follow the rules of the marketplace.',
          'Meskni may remove or restrict content that violates the platform rules, is misleading, or creates risk for other users.',
        ],
      },
      {
        heading: 'Payments and fees',
        text: [
          'Any platform fees or service charges are clearly disclosed before you complete a payment action. We do not add hidden or surprise fees to listings or accounts.',
          'Where a payment service is used, its own terms apply in addition to these general platform terms.',
        ],
      },
      {
        heading: 'Service availability',
        text: [
          'We work to keep Meskni available and secure, but we cannot guarantee uninterrupted service. Features may change as the platform evolves.',
          'In the event of a dispute, the parties may attempt to resolve the issue through direct communication and platform moderation before pursuing formal remedies.',
        ],
      },
    ],
  },
  'refund-policy': {
    title: 'Refund Policy',
    intro: 'Meskni charges for services only when a feature is explicitly requested or purchased.',
    sections: [
      {
        heading: 'Eligibility',
        text: [
          'If a paid service is not delivered as described, or if a platform fee is charged due to an error, you may request a refund within 7 days of the purchase date.',
          'Refunds are not available for digital or delivered services that have been materially used or completed, unless otherwise required by local law.',
        ],
      },
      {
        heading: 'How to request it',
        text: [
          'Send your request to hello@meskni.ma with the order reference, the date of purchase, and a short explanation of the issue.',
          'We review refund requests promptly and respond with a clear decision and next steps when a request is accepted.',
        ],
      },
    ],
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    intro: 'We use cookies to keep the site functioning well and to improve the experience for future visitors.',
    sections: [
      {
        heading: 'Essential cookies',
        text: [
          'Essential cookies maintain login sessions, remember your saved preferences, and help the platform load correctly on your device.',
          'Without these cookies, some account and listing features would not work properly.',
        ],
      },
      {
        heading: 'Analytics cookies',
        text: [
          'Analytics cookies help us learn which pages and features people use most often. This helps us improve search tools, filters, and common user journeys.',
          'You can choose to disable analytics cookies at any time from the site banner or by updating your browser settings.',
        ],
      },
    ],
  },
}

export function LegalPage() {
  const { slug } = useParams()
  const content = legalContent[slug ?? 'privacy-policy'] ?? legalContent['privacy-policy']

  return (
    <main className="legal-page site-shell">
      <nav className="topbar" aria-label="Legal navigation">
        <Link className="brand" to="/">meskni</Link>
        <Link className="button button-quiet" to="/">Back to home</Link>
      </nav>

      <article className="legal-card">
        <p className="eyebrow">Legal information</p>
        <h1>{content.title}</h1>
        <p className="legal-intro">{content.intro}</p>

        {content.sections.map((section) => (
          <section key={section.heading} className="legal-section">
            <h2>{section.heading}</h2>
            {section.text.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}

        <div className="legal-note">
          For questions or requests, contact <a href="mailto:hello@meskni.ma">hello@meskni.ma</a>.
        </div>
      </article>
    </main>
  )
}
