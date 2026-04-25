export const getSourceFromLink = (link) => {
  if (!link) return "Others";
  const l = link.toLowerCase();
  if (l.includes("luogu.com")) return "Luogu";
  if (l.includes("codeforces.com")) return "Codeforces";
  if (l.includes("atcoder.jp")) return "AtCoder";
  if (l.includes("qoj.ac")) return "QOJ";
  if (l.includes("uoj.ac")) return "UOJ";
  if (l.includes("zhengruioi.com")) return "Zhengrui";
  return "Others";
};

export const parseMarkdown = (fileContent) => {
  try {
    const frontmatterRegex = /^---\s*([\s\S]*?)\s*---/;
    const match = fileContent.match(frontmatterRegex);
    const metadata = {};
    let content = fileContent;

    if (match) {
      const yaml = match[1];
      yaml.split("\n").forEach(line => {
        const splitIdx = line.indexOf(':');
        if (splitIdx !== -1) {
          const key = line.slice(0, splitIdx).trim();
          let value = line.slice(splitIdx + 1).trim().replace(/^["']|["']$/g, "");
          if (value.startsWith("[") && value.endsWith("]")) {
            value = value.slice(1, -1).split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
          }
          metadata[key] = value;
        }
      });
      content = fileContent.replace(frontmatterRegex, "").trim();
    }
    return { ...metadata, content };
  } catch (e) { return null; }
};

export const getRatingColor = (rating) => {
  // 无论难度数值是多少，都统一返回 Tailwind 的红色类名
  return 'text-red-600'; 
};