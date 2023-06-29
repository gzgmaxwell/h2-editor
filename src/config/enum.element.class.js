import EqxText from '../core/html/element/text'
import EqxTextThreeD from '../core/html/element/textThreeD'
import EqxImage from '../core/html/element/image'
import EqxShape from '../core/html/element/shape'
import EqxQrcode from '../core/html/element/qrcode'
import EqxFrame from '../core/html/element/frame'
import Combine from '../core/html/element/combine'
import EqxDate from '../core/html/element/date'
import EqxGif from '../core/html/element/gif'
import EqxCrop from '../photo/core/html/element/crop'
import EqxPhotoText from '../photo/core/html/element/text'
import EqxPhotoShape from '../photo/core/html/element/shape'
import EqxPhotoImage from '../photo/core/html/element/image'
import EqxTable from '../core/html/element/table'
import EqxPuzzle from '../core/html/element/puzzle'

const elementClass = {
    101: EqxText,
    102: EqxImage,
    103: EqxQrcode,
    104: EqxShape,
    105: EqxFrame,
    106: Combine,
    107: EqxDate,
    108: EqxGif,
    109: EqxCrop,
    110: EqxPhotoText,
    111: EqxPhotoShape,
    112: EqxPhotoImage,
    113: EqxTextThreeD,
    114: EqxTable,
    115: EqxPuzzle
}

export default elementClass
