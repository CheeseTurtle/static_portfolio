export interface Language {
  name: string;
  iconName: string;
  className?: string;
}

export const languages: Record<string, Language> = {
  c: {
    name: "C",
    iconName: "C"
  },
  c_sharp: {
    name: "C#",
    iconName: "csharp"
  },
  blender: {
    name: "Blender 3D",
    iconName: "Blender"
  },
  bash: {
    name: "Bash",
    iconName: "Bash"
  },
  emacs: {
    name: "Emacs",
    iconName: "GNU Emacs"
  },
  rocq: {
    name: "ROCQ",
    iconName: "icon-rocq-orange"
  },
  latex: {
    name: "LaTeX",
    iconName: "LaTeX"
  },
  max_msp: {
    name: "Max/MSP",
    iconName: "Logo_Max_8_software.jpg"
  },
  lua: {
    name: "Lua",
    iconName: "Lua"
  },
  matlab: {
    name: "MATLAB",
    iconName: "MATLAB"
  },
  nvim: {
    name: "NeoVim",
    iconName: "Neovim-mark"
  },
  powershell: {
    name: "PowerShell",
    iconName: "Powershell"
  },
  pytorch: {
    name: "PyTorch",
    iconName: "PyTorch"
  },
  swipl: {
    name: "SWI-Prolog",
    iconName: "swipl-128.png"
  },
  typst: {
    name: "Typst",
    iconName: "typst.jpeg"
  },
  ubuntu: {
    name: "Ubuntu",
    iconName: "Ubuntu"
  },
  // numpy: {
  //   name: "NumPy",
  //   iconName: "NumPy"
  // },
  // pandas: {
  //   name: "PANDAS",
  //   iconName: "Pandas"
  // },
  // markdown: {
  //   name: "Markdown",
  //   iconName: "markdown",
  // },
  git: {
    name: "Git",
    iconName: "git",
  },
  python: {
    name: "Python",
    iconName: "python",
  },
};

export const getLanguage = (lang: string): Language => {
  // console.log(lang)
  return languages[lang] || languages.python;
}; 