import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

/**
 * Shared layout configurations
 *
 * you can customise layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <svg
            width={24}
            height={24}
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Logo"
            role="img"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 7V17L12 22L22 17V7"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M17 9L7 14"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          小班课文档
        </>
      ),
    },
    // see https://fumadocs.dev/docs/ui/navigation/links
    githubUrl: 'https://github.com/wjsoj/fumadocs-sds',
    links: [],
  };
}
