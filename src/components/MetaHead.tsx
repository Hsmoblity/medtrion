import Head from "next/head";
import { useRouter } from "next/router";
import { stripHtml } from "lib/utils/text";
import { normalizeImageUrl } from "lib/utils/image";

interface MetaHeadProps {
  title?: string;
  description: string;
  featuredImage?: string;
  type?: string;
}

const siteUrl = "https://hsmobility.ca";

const MetaHead: React.FC<MetaHeadProps> = ({
  title,
  description,
  featuredImage,
  type = "article"
}) => {
  const Router = useRouter();

  return (
    <Head>
      <title>{`HS Mobility${title ? ` | ${title}` : ``}`}</title>
      <meta name="description" content={stripHtml(description)} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={stripHtml(description)} />

      {featuredImage && (
        <meta property="og:image" content={`${normalizeImageUrl(featuredImage)}`} />
      )}
      {type && <meta property="og:type" content={type} />}
      <meta property="og:url" content={`${siteUrl}${Router.asPath}`} />
    </Head>
  );
};

export default MetaHead;
