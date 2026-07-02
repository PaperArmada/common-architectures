import type { ComponentProps } from 'react'
import { Link } from 'react-router-dom'
import { findTerm } from '../data/glossary'

/**
 * Anchor override for MDX content. Internal links (glossary auto-links and any
 * `/...` link) render as client-side router links; glossary links also carry a
 * hover definition. External links open in a new tab.
 */
function MdxAnchor({ href = '', className, children, ...rest }: ComponentProps<'a'>) {
  const isInternal = href.startsWith('/')
  if (isInternal) {
    const isGloss = typeof className === 'string' && className.includes('gloss-term')
    const slug = href.includes('#') ? href.split('#')[1] : ''
    const term = isGloss && slug ? findTerm(slug) : undefined
    return (
      <Link to={href} className={className} title={term?.short} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

export const mdxComponents = {
  a: MdxAnchor,
}
