import { Link } from '@tanstack/react-router'
import { catalogue } from '#/data/catalogue'
import { site } from '#/data/site'

export function Footer() {
  return (
    <footer className="bg-green-deep pt-16 pb-8 text-[1rem] text-cream/80">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-10 border-b border-gold/30 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-12">
          <div>
            <img
              src="/img/logo-large.png"
              alt={site.name}
              width={255}
              height={221}
              className="mb-5 h-[110px] w-auto"
            />
            <p className="max-w-[36ch]">
              Since {site.established}, delighting Perth with world-famous apple
              strudels, continental cakes and traditional Italian pastries.
            </p>
          </div>
          <div>
            <p className="mb-4 font-body text-[0.75rem] uppercase tracking-[0.28em] text-gold">
              The Patisserie
            </p>
            <ul className="space-y-2">
              {catalogue.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/patisserie/$category"
                    params={{ category: c.slug }}
                    className="hover:text-gold-soft"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 font-body text-[0.75rem] uppercase tracking-[0.28em] text-gold">
              Visit Us
            </p>
            <ul className="space-y-2">
              <li>{site.address.street}</li>
              <li>
                {site.address.suburb} {site.address.state}{' '}
                {site.address.postcode}
              </li>
              <li>
                <a href={site.phone.href} className="hover:text-gold-soft">
                  {site.phone.display}
                </a>
              </li>
              <li className="pt-2">
                <Link to="/contact" className="hover:text-gold-soft">
                  Hours &amp; directions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-4 font-body text-[0.75rem] uppercase tracking-[0.28em] text-gold">
              Follow
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href={site.social.facebook}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-gold-soft"
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href={site.social.instagram}
                  target="_blank"
                  rel="noopener"
                  className="hover:text-gold-soft"
                >
                  Instagram
                </a>
              </li>
            </ul>
            <p className="mt-8 mb-4 font-body text-[0.75rem] uppercase tracking-[0.28em] text-gold">
              More
            </p>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="hover:text-gold-soft">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="hover:text-gold-soft">
                  FAQs
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-gold-soft">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap justify-between gap-4 pt-6 text-[0.82rem] tracking-[0.08em]">
          <span>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>
            {site.legalName} &middot; {site.address.suburb}, Western Australia
            &middot; Est. {site.established}
          </span>
        </div>
      </div>
    </footer>
  )
}
