import useAuthContext from '../useAuthContext';
import { useMutation } from 'react-query';
import TokenService from '../../features/Token/TokenService';
import MediaService from '../../config/http/MediaService';
import { message } from 'antd';
import { CollectionFormValues } from '../../features/Collections/pages/CreateCollectionPage';
import { CollectionFormValues as CollectionUpdateFormValues } from '../../features/Collections/pages/UpdateCollectionPage';

enum CollectionImageRoles {
  wallpaper = 'wallpaper',
  avatar = 'avatar',
}

export const useCollectionTransactionHandler = ({ showNoExtratonException }: Props) => {
  const { walletAddress } = useAuthContext();
  const imagesMutation = useMutation(MediaService.post);
  const collectionMutation = useMutation(TokenService.createCollection);
  const updateMutation = useMutation(TokenService.updateCollection);

  const update = async (
    values: CollectionUpdateFormValues,
    onSuccess: () => void,
    thumbnailBlob: Blob | null,
    wallpaperBlob: Blob | null,
  ) => {
    if (!walletAddress) {
      showNoExtratonException();
      return;
    }

    try {
      let avatar;
      let wallpaper;

      if (thumbnailBlob) {
        avatar = await imagesMutation?.mutateAsync(thumbnailBlob);
      } else {
        avatar = values.avatar.file
          ? await imagesMutation?.mutateAsync(values.avatar.file)
          : values.avatar;
      }

      if (wallpaperBlob) {
        wallpaper = await imagesMutation?.mutateAsync(wallpaperBlob);
      } else {
        wallpaper = values.wallpaper.file
          ? await imagesMutation?.mutateAsync(values.wallpaper.file)
          : values.wallpaper;
      }

      await updateMutation.mutateAsync({
        media: [
          {
            hash: avatar?.hash || '',
            width: values.avatar.width,
            height: values.avatar.height,
            subtitle: values.avatar.subtitle,
            weight: values.avatar.file?.size || values.avatar.weight,
            mimetype: values.avatar.file?.type || values.avatar.mimetype,
            role: CollectionImageRoles.avatar,
          },
          {
            hash: wallpaper?.hash || '',
            width: values.wallpaper.width,
            height: values.wallpaper.height,
            subtitle: values.wallpaper.subtitle,
            weight: values.wallpaper.file?.size || values.wallpaper.weight,
            mimetype: values.wallpaper.file?.type || values.wallpaper.mimetype,
            role: CollectionImageRoles.wallpaper,
          },
        ],
        creator: walletAddress,
        collectionID: values.collectionID,
        about: values.description,
        title: values.title,
      });
      message.success('Collection updated');
      onSuccess();
    } catch (e: any) {
      console.log(e);
      message.error(e.message);
    }
  };

  const create = async (
    values: CollectionFormValues,
    onSuccess: () => void,
    accountNumber: number | undefined,
    thumbnailBlob: Blob | null,
    wallpaperBlob: Blob | null,
    blockchain: 'everscale' | 'binance',
  ) => {
    if (!walletAddress || !accountNumber) {
      showNoExtratonException();
      return;
    }

    try {
      const thumbnail =
        (thumbnailBlob && (await imagesMutation?.mutateAsync(thumbnailBlob))) || null;
      const wallpaper =
        (wallpaperBlob && (await imagesMutation?.mutateAsync(wallpaperBlob))) || null;

      const media = [];

      if (thumbnail) {
        media.push({
          hash: thumbnail?.hash || '',
          width: values.thumbnail.width,
          height: values.thumbnail.height,
          subtitle: values.thumbnail.subtitle,
          weight: values.thumbnail.file.size,
          mimetype: values.thumbnail.file.type,
          role: CollectionImageRoles.avatar,
        });
      }

      if (wallpaper) {
        media.push({
          hash: wallpaper?.hash || '',
          width: values.wallpaper.width,
          height: values.wallpaper.height,
          subtitle: values.wallpaper.subtitle,
          weight: values.wallpaper.file.size,
          mimetype: values.wallpaper.file.type,
          role: CollectionImageRoles.wallpaper,
        });
      }
      if (values.collectionID) {
        await collectionMutation?.mutateAsync({
          media: (media && media.length > 0 && media) || null,
          creator: walletAddress,
          creatorAccountNumber: accountNumber,
          collectionID: values.collectionID,
          about: values.description,
          title: values.title,
          blockchain,
        });

        message.success('Collection created');
        onSuccess();
      } else {
        await collectionMutation?.mutateAsync({
          media: (media && media.length > 0 && media) || null,
          creator: walletAddress,
          creatorAccountNumber: accountNumber,
          about: values.description,
          title: values.title,
          blockchain,
        });
        onSuccess();
      }
    } catch (e: any) {
      console.log(e);
      message.error(e.message);
    }
  };

  return { create, update };
};

interface Props {
  showNoExtratonException: () => void;
}
