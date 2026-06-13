/**
 * LR-32: タブ独立履歴スタック（最小実装）。
 *
 * 各タブが「最後に表示していた画面」を覚えておき、タブを再訪したときに
 * その画面へ復元するための純粋ロジック。AppV3 の既存ナビ
 * （navigate / handleBack / popstate / deep link / SSE）には手を入れず、
 * handleTabChange からのみ利用する。
 *
 * 復元対象にしてよいのは以下を満たす画面のみ:
 *   - ルート画面ではない（ルートはタブ切替で常にそこへ行くため覚える意味がない）
 *   - 再起動でも安全に復元できる画面（揮発状態を持たない）。これは AppV3 側の
 *     PERSISTABLE_SCREENS を「復元可能集合」として渡してもらい判定する。
 *
 * 判断は「壊す方に倒さない」: 迷ったら覚えない / 復元しない（= 従来どおり
 * ルートへ行く）方向に倒す。
 *
 * Screen 型は AppV3 側に閉じているため、ここでは `{ type: string }` を満たす
 * 任意のオブジェクトをジェネリックに扱う（純粋・依存なし）。
 */

/** 最低限 type を持つ画面オブジェクト */
export interface ScreenLike {
  type: string
}

/** タブごとの最後の画面を覚えるストア（タブ ID → Screen） */
export type TabStack<S extends ScreenLike = ScreenLike> = Map<string, S>

export function createTabStack<S extends ScreenLike = ScreenLike>(): TabStack<S> {
  return new Map<string, S>()
}

export interface RememberOptions {
  /** ルート画面 type の集合（ROOT_SCREENS）。ここに含まれる画面は覚えない */
  rootScreens: ReadonlySet<string>
  /** 復元しても安全な画面 type の集合（PERSISTABLE_SCREENS）。含まれない画面は覚えない */
  restorableScreens: ReadonlySet<string>
}

/** その画面 type を覚えて良いか（ルートでなく、かつ復元可能） */
function isRememberable(screenType: string, opts: RememberOptions): boolean {
  return !opts.rootScreens.has(screenType) && opts.restorableScreens.has(screenType)
}

/**
 * タブを離れる直前に、そのタブで表示していた画面を覚える。
 *
 * 覚える条件（すべて満たす場合のみ）:
 *   - ルート画面ではない
 *   - 復元可能（restorableScreens に含まれる）
 * いずれかを満たさない場合は、過去の記憶を消す（次回はルートへ戻す）。
 */
export function rememberScreen<S extends ScreenLike>(
  stack: TabStack<S>,
  tab: string,
  screen: S,
  opts: RememberOptions,
): void {
  if (isRememberable(screen.type, opts)) {
    stack.set(tab, screen)
  } else {
    // ルート画面 or 揮発画面に居た場合は記憶しない（古い記憶も破棄）
    stack.delete(tab)
  }
}

/**
 * タブ再訪時に復元すべき画面を返す。なければ null（従来どおりルートへ）。
 * 念のため復元前にも復元可能性を再検証する（壊す方に倒さない）。
 */
export function restoreScreen<S extends ScreenLike>(
  stack: TabStack<S>,
  tab: string,
  opts: RememberOptions,
): S | null {
  const remembered = stack.get(tab)
  if (!remembered) return null
  if (!isRememberable(remembered.type, opts)) {
    stack.delete(tab)
    return null
  }
  return remembered
}
