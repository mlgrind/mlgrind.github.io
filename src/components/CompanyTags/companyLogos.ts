/**
 * Company logos from Simple Icons (CC0 package; the marks remain trademarks of
 * their owners). Import each icon individually so the bundler keeps only these.
 * Companies without an icon here get a neutral monogram (see CompanyLogo).
 *
 * Simple Icons no longer ships Amazon, AWS, OpenAI or Microsoft marks at the
 * owners' request, so those companies use the monogram too. Uber's icon is a
 * wordmark that is unreadable at chip size, so Uber gets the monogram as well.
 */
import {
  siAnthropic,
  siApple,
  siBytedance,
  siDatabricks,
  siDatadog,
  siMeta,
  siMistralai,
  siNvidia,
  siPinterest,
  siSpacex,
  siTesla,
} from 'simple-icons';

export interface LogoIcon {
  /** SVG path data for a 24x24 viewBox. */
  path: string;
}

export const companyLogos: Record<string, LogoIcon> = {
  Anthropic: siAnthropic,
  Apple: siApple,
  ByteDance: siBytedance,
  Databricks: siDatabricks,
  Datadog: siDatadog,
  'Mistral AI': siMistralai,
  Meta: siMeta,
  NVIDIA: siNvidia,
  Pinterest: siPinterest,
  SpaceX: siSpacex,
  Tesla: siTesla,
};
