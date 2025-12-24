import postcss from "postcss";
import selectorParser from "postcss-selector-parser";

export function scopeSelectors(css: string, scope: string = ".dark") {
  const root = postcss.parse(css);

  root.walkRules(rule => {
    // Ignore keyframes
    if (
      rule.parent?.type === "atrule" &&
      rule.parent.name === "keyframes"
    ) {
      return;
    }

    rule.selectors = rule.selectors.map(selector =>
      selectorParser(selectors => {
        selectors.each(sel => {
          sel.prepend(
            selectorParser.className({ value: scope.slice(1) }),
            // selectorParser.combinator({ value: " " })
          );
        });
      }).processSync(selector)
    );
  });

  return root.toString();
}
