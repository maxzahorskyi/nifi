import React from 'react';

class StringUtil {
  public static prepareMultilineTextForRendering(string: string) {
    return string.split('\n').map((part, index, parts) => (
      <React.Fragment key={index}>
        {part}
        {index !== parts.length - 1 && <br />}
      </React.Fragment>
    ));
  }
}

export default StringUtil;
