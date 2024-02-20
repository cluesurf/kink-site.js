import Kink from '@termsurf/kink'

export const host = '@termsurf/kink-site'

type BaseZodError = {
  link: Array<string | number>
  message: string
}

type Base = {
  call_time_meet: {
    take: {
      link: string
    }
    // base: {
    //   url: string
    // }
    // fill: {
    //   url: string
    // }
  }
  call_fail: {
    take: {}
  }
  form_fail: {
    take: BaseZodError & {
      need: string
      have: string
    }
  }
  form_link_fail: {
    take: BaseZodError & {
      list: Array<string>
    }
  }
}

type Name = keyof Base

let CODE_INDEX = 1

const CODE = {
  call_time_meet: CODE_INDEX++,
  call_fail: CODE_INDEX++,
  form_fail: CODE_INDEX++,
  form_link_fail: CODE_INDEX++,
}

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

Kink.base(
  host,
  'call_time_meet',
  (take: Base['call_time_meet']['take']) => ({
    code: CODE.call_time_meet,
    note: 'Request timeout.',
    link: take.link,
  }),
)

Kink.base(host, 'call_fail', () => ({
  code: CODE.call_fail,
  note: 'System unable to make request currently.',
}))

Kink.base(host, 'form_fail', (take: Base['form_fail']['take']) => ({
  code: CODE.form_fail,
  note: 'Invalid link type.',
  need: take.need,
  have: take.have,
  link: take.link,
  hint: take.message,
}))

// https://github.com/colinhacks/zod/blob/master/ERROR_HANDLING.md
Kink.base(
  host,
  'form_link_fail',
  (take: Base['form_link_fail']['take']) => ({
    code: CODE.form_link_fail,
    note: 'Unrecognized keys in object.',
    list: take.list,
    link: take.link,
    hint: take.message,
  }),
)

export default function makeBase<N extends Name>(
  form: N,
  link?: Base[N]['take'],
  siteCode?: number,
) {
  const kink = Kink.make(host, form, link)
  kink.siteCode = siteCode
  return kink
}
