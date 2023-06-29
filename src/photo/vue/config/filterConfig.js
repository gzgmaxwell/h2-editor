// 滤镜特效配置文件 该特效 全部以super的权限配置
const filterConfig = [
    {
        groupName: '暖暖寒冬',
        state: false,
        list: [
            {
                name: '暖暖寒冬1',
                state: false,
                effect: {
                    brightness: 5, saturation: 10, vibrance: 40, sepia: 10

                }
            },
            {
                name: '暖暖寒冬2',
                state: false,
                effect: {
                    contrast: 10, saturation: 20, vibrance: -50
                }
            },
            {
                name: '暖暖寒冬3',
                state: false,
                effect: {
                    brightness: 7, saturation: 50, vibrance: -40, sepia: 6
                }
            },
            {
                name: '暖暖寒冬4',
                state: false,
                effect: {
                    brightness: 9, saturation: 30, sepia: 22
                }
            },
            {
                name: '暖暖寒冬5',
                state: false,
                effect: {
                    brightness: 5, saturation: 30
                }
            }
        ]
    }, {
        groupName: 'LOMO',
        state: false,
        list: [
            {
                name: 'LOMO1',
                state: false,
                effect: {
                    brightness: 10, hue: -8
                }
            },
            {
                name: 'LOMO2',
                state: false,
                effect: {
                    brightness: 8, saturation: 40, vibrance: 10, sepia: 42
                }
            },
            {
                name: 'LOMO3',
                state: false,
                effect: {
                    brightness: 5, contrast: 10, saturation: -15, vibrance: 40, hue: 4
                }
            },
            {
                name: 'LOMO4',
                state: false,
                effect: {
                    brightness: 10, saturation: 30, sepia: 26, hue: 6
                }
            },
            {
                name: 'LOMO5',
                state: false,
                effect: {
                    brightness: 10, contrast: 13, saturation: 15, sepia: 25, hue: -4
                }
            }
        ]
    }, {
        groupName: '电影人生',
        state: false,
        list: [
            {
                name: '电影人生1',
                state: false,
                effect: {
                    brightness: -10, contrast: 6, hue: 4
                }
            },
            {
                name: '电影人生2',
                state: false,
                effect: {
                    brightness: 5, contrast: 10, hue: 4, noise: 10
                }
            },
            {
                name: '电影人生3',
                state: false,
                effect: {
                    brightness: 5, contrast: 15, sepia: 30, noise: 10
                }
            },
            {
                name: '电影人生4',
                state: false,
                effect: {
                    contrast: 10, vibrance: 20, sepia: 20
                }
            },
            {
                name: '电影人生5',
                state: false,
                effect: {
                    brightness: 5, contrast: 20, noise: 5
                }
            }
        ]
    }, {
        groupName: '油彩画章',
        state: false,
        list: [
            {
                name: '油彩画章1',
                state: false,
                effect: {
                    contrast: 15, unsharpMask: 10, vibrance: 20
                }
            },
            {
                name: '油彩画章2',
                state: false,
                effect: {
                    brightness: -12, contrast: 15, unsharpMask: 10
                }
            },
            {
                name: '油彩画章3',
                state: false,
                effect: {
                    brightness: -20, saturation: 15, unsharpMask: 10, hue: 5
                }
            },
            {
                name: '油彩画章4',
                effect: {
                    saturation: 12, unsharpMask: 15, vibrance: 40
                }
            },
            {
                name: '油彩画章5',
                state: false,
                effect: {
                    brightness: -10, unsharpMask: 10
                }
            }
        ]
    }, {
        groupName: '怀旧',
        state: false,
        list: [
            {
                name: '怀旧1',
                state: false,
                effect: {
                    brightness: 5, contrast: 9, sepia: 25, hue: 6
                }
            },
            {
                name: '怀旧2',
                state: false,
                effect: {
                    contrast: 20, saturation: -70
                }
            },
            {
                name: '怀旧3',
                state: false,
                effect: {
                    contrast: 10, saturation: -40, vibrance: 50, hue: -5
                }
            },
            {
                name: '怀旧4',
                state: false,
                effect: {
                    saturation: 10, vibrance: 30, sepia: 30, hue: -5
                }
            },
            {
                name: '怀旧5',
                state: false,
                effect: {
                    contrast: 10, vibrance: -20, hue: 10
                }
            }
        ]
    }, {
        groupName: '单色印象',
        state: false,
        list: [
            {
                name: '单色印象1',
                state: false,
                effect: {
                    brightness: -10, saturation: -100, noise: 14
                }
            },
            {
                name: '单色印象2',
                state: false,
                effect: {
                    contrast: 20, saturation: -90, sepia: 5, noise: 10
                }
            },
            {
                name: '单色印象3',
                state: false,
                effect: {
                    brightness: 10, contrast: 30, saturation: -100, sepia: 5
                }
            },
            {
                name: '单色印象4',
                state: false,
                effect: {
                    brightness: 5, contrast: 40, saturation: -100
                }
            },
            {
                name: '单色印象5',
                state: false,
                effect: {
                    brightness: -10, contrast: 10, saturation: -90, hue: 10
                }
            }
        ]
    }, {
        groupName: '褪色经典',
        state: false,
        list: [
            {
                name: '褪色经典1',
                state: false,
                effect: {
                    brightness: 10, saturation: 20, vibrance: 10, sepia: 30
                }
            },
            {
                name: '褪色经典2',
                state: false,
                effect: {
                    brightness: 10, saturation: 30, vibrance: 10, sepia: 30, hue: -10
                }
            },
            {
                name: '褪色经典3',
                state: false,
                effect: {
                    brightness: 10, contrast: 10, sepia: 24
                }
            },
            {
                name: '褪色经典4',
                state: false,
                effect: {
                    brightness: 10, contrast: 10, sepia: 60
                }
            },
            {
                name: '褪色经典5',
                state: false,
                effect: {
                    brightness: 10, saturation: 23, vibrance: 11, hue: 6
                }
            }
        ]
    }
]

export default filterConfig
